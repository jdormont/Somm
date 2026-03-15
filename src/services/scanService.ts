import { supabase } from '../lib/supabase';
import { ScanSession, ScanResult, ScanRequest } from '../types';

export const scanService = {
  /**
   * Fetch all scan sessions for a user
   */
  async getSessions(userId: string): Promise<ScanSession[]> {
    const { data, error } = await supabase
      .from('scan_sessions')
      .select('id, user_id, context, notes, summary, created_at, budget_min, budget_max, wines_detected, recommendations')
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
  async analyzeWine(payload: ScanRequest): Promise<ScanResult> {
    
    // Check current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // We rely on the supabase client to handle auth headers automatically
    // But verify we have a session first
    if (!sessionData.session) {
        throw new Error('No active session found. Please sign in again.');
    }

    const { data, error } = await supabase.functions.invoke('analyze-wine', {
      body: payload,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`
      }
    });

    if (error) {
       console.error('Supabase Function Invoke Error:', error);
       
       // Propagate specific status codes if needed
       if (error.status === 401) throw new Error('Unauthorized - Please ensure you are logged in.');
       throw new Error(error.message || 'Analysis failed');
    }

    return data;
  }
};
