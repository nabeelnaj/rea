import { supabase } from '../lib/supabase';

export interface Rider {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  joining_date?: string;
  base_salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const riderService = {
  async getAllRiders(): Promise<Rider[]> {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getRiderById(id: string): Promise<Rider> {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Rider not found');
    return data;
  },

  async createRider(rider: Omit<Rider, 'id' | 'created_at' | 'updated_at'>): Promise<Rider> {
    const { data, error } = await supabase
      .from('riders')
      .insert([rider])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateRider(id: string, rider: Partial<Rider>): Promise<Rider> {
    const { data, error } = await supabase
      .from('riders')
      .update(rider)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRider(id: string): Promise<void> {
    const { error } = await supabase
      .from('riders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
