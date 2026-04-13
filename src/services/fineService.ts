import { supabase } from '../lib/supabase';

export interface Fine {
  id: string;
  rider_id: string;
  amount: number;
  description?: string;
  category?: string;
  issued_date: string;
  reason?: string;
  status: 'pending' | 'deducted';
  created_at: string;
  updated_at: string;
}

export const fineService = {
  async getAllFines(): Promise<Fine[]> {
    const { data, error } = await supabase
      .from('fines')
      .select('*')
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getFinesByRider(riderId: string): Promise<Fine[]> {
    const { data, error } = await supabase
      .from('fines')
      .select('*')
      .eq('rider_id', riderId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getTotalFinesByRider(riderId: string): Promise<number> {
    const { data, error } = await supabase
      .from('fines')
      .select('amount')
      .eq('rider_id', riderId)
      .eq('status', 'pending');
    if (error) throw error;
    return (data || []).reduce((sum, fine) => sum + fine.amount, 0);
  },

  async createFine(fine: Omit<Fine, 'id' | 'created_at' | 'updated_at'>): Promise<Fine> {
    const { data, error } = await supabase
      .from('fines')
      .insert([fine])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateFine(id: string, fine: Partial<Fine>): Promise<Fine> {
    const { data, error } = await supabase
      .from('fines')
      .update(fine)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteFine(id: string): Promise<void> {
    const { error } = await supabase
      .from('fines')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
