import { supabase } from '../lib/supabase';

export interface Leave {
  id: string;
  rider_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const leaveService = {
  async getAllLeaves(): Promise<Leave[]> {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getLeavesByRider(riderId: string): Promise<Leave[]> {
    const { data, error } = await supabase
      .from('leaves')
      .select('*')
      .eq('rider_id', riderId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createLeave(leave: Omit<Leave, 'id' | 'created_at' | 'updated_at'>): Promise<Leave> {
    const { data, error } = await supabase
      .from('leaves')
      .insert([leave])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateLeave(id: string, leave: Partial<Leave>): Promise<Leave> {
    const { data, error } = await supabase
      .from('leaves')
      .update(leave)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteLeave(id: string): Promise<void> {
    const { error } = await supabase
      .from('leaves')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async approveLeave(id: string, userId: string, notes?: string): Promise<Leave> {
    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: userId,
        notes,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async rejectLeave(id: string, notes?: string): Promise<Leave> {
    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: 'rejected',
        notes,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
