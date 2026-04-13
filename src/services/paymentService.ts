import { supabase } from '../lib/supabase';

export interface Payment {
  id: string;
  rider_id: string;
  period_start: string;
  period_end: string;
  base_amount: number;
  total_fines: number;
  net_amount: number;
  status: 'pending' | 'paid';
  paid_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const paymentService = {
  async getAllPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('period_start', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPaymentsByRider(riderId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('rider_id', riderId)
      .order('period_start', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsPaid(id: string, paidDate: string): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        paid_date: paidDate,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
