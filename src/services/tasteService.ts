
import { supabase } from '../lib/supabase';

export interface AnchorAnalysisRequest {
  query?: string;
  image_base64?: string;
}

export interface AnchorAnalysisResult {
    wine_name: string;
    producer: string;
    vintage?: string;
    profile: {
        body: number;
        tannin: number;
        acidity: number;
        earthiness: number;
        oak: number;
    };
    confidence: string;
    data_source: string;
    source_url?: string;
}

export const tasteService = {
  /**
   * Invoke the analyze-anchor-wine edge function
   */
  async analyzeAnchorWine(payload: AnchorAnalysisRequest): Promise<AnchorAnalysisResult> {
    
    // Check current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
        throw new Error('No active session found. Please sign in again.');
    }

    const { data, error } = await supabase.functions.invoke('analyze-anchor-wine', {
      body: payload,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`
      }
    });

    if (error) {
       console.error('Supabase Function Invoke Error:', error);
       
       if (error.status === 401) throw new Error('Unauthorized - Please ensure you are logged in.');
       
       // Try to parse the response error from the context
       try {
         // @ts-ignore - Supabase error context type isn't fully exposed but exists at runtime
         if (error.context && typeof error.context.json === 'function') {
            // @ts-ignore
            const body = await error.context.json();
            if (body && body.error) {
                throw new Error(body.error);
            }
         }
       } catch (e) {
         // Ignore parsing errors and fall back to default message
       }

       throw new Error(error.message || 'Analysis failed');
    }

    return data;
  }
};
