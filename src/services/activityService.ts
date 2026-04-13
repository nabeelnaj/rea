import { supabase } from '../lib/supabase';

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  created_at: string;
}

export const activityService = {
  async logActivity(
    action: string,
    entityType: string,
    entityId?: string,
    details?: string,
    userId?: string
  ): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([
        {
          action,
          entity_type: entityType,
          entity_id: entityId,
          details,
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  },

  async getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
