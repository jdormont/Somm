import { supabase } from '../lib/supabase';
import { ScanSession, ScanResult, ScanRequest } from '../types';

export const scanService = {
  /**
   * Fetch all scan sessions for a user
   */
  async getSessions(userId: string): Promise<ScanSession[]> {
    const { data, error } = await supabase
      .from('scan_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch a single scan session by ID
   */
  async getSessionById(id: string, userId: string): Promise<ScanSession | null> {
    const { data, error } = await supabase
      .from('scan_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a scan session
   */
  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('scan_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Save a new scan session
   */
  async createSession(session: Omit<ScanSession, 'id' | 'created_at'>): Promise<ScanSession> {
    const { data, error } = await supabase
      .from('scan_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Invoke the analyze-wine edge function
   * Note: This is a direct wrapper around functions.invoke
   */
  async analyzeWine(payload: ScanRequest, token: string): Promise<ScanResult> {
    
    const { data, error } = await supabase.functions.invoke('analyze-wine', {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (error) {
       // Propagate specific status codes if needed
       if (error.status === 401) throw new Error('Unauthorized');
       throw new Error(error.message || 'Analysis failed');
    }

    return data;
  }
};
