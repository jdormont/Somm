export type ContextType = 'store' | 'restaurant';
export type DateFilter = 'all' | 'week' | 'month' | '3months';
export type SortOption = 'date_desc' | 'date_asc' | 'match_desc';

export interface WineDetected {
  name: string;
  producer: string | null;
  vintage: string | null;
  type: string;
  region: string | null;
  price: number | null;
}

export interface WineRecommendation {
  rank: number;
  name: string;
  producer: string | null;
  vintage: string | null;
  type: string;
  region: string | null;
  price: number | null;
  match_score: number;
  critic_info: string | null;
  reasoning: string;
  tasting_notes: string;
  food_pairings: string[];
  profile_accuracy?: string;
  structure?: {
    body: 'Light' | 'Medium' | 'Full';
    tannins: 'Low' | 'Medium' | 'High';
    acidity: 'Low' | 'Medium' | 'High';
    alcohol: 'Low' | 'Medium' | 'High';
  };
}

export interface ScanSession {
  id: string;
  user_id: string;
  budget_min: number;
  budget_max: number;
  context: ContextType;
  notes: string;
  wines_detected: WineDetected[];
  recommendations: WineRecommendation[];
  summary: string;
  debug_info?: {
    allWinesFound: WineDebugInfo[];
    researchedWines: WineDebugInfo[];
  };
  created_at: string;
}

export interface WineDebugInfo {
  name: string;
  vintage?: string | null;
  price_seen?: number | null;
  profile_match_score: number;
  quality_score: number;
  reasoning?: string;
  final_score?: number;
}

export interface ScanResult {
  wines_detected: WineDetected[];
  recommendations: WineRecommendation[];
  summary: string;
  debug?: {
    allWinesFound: WineDebugInfo[];
    researchedWines: WineDebugInfo[];
  };
}

export interface ScanRequest {
  image_base64: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: any; // Complex object, keeping as any for now to avoid deep nesting issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wine_memories: any[]; // Complex object
  budget_min: number;
  budget_max: number;
  context: string;
  notes: string;
  openai_api_key?: string | null;
  food_context?: string;
}

export interface WineInput {
  name: string;
  producer?: string | null;
  vintage?: string | null;
  type: string;
  region?: string | null;
  price?: number | null;
  notes?: string;
  rating?: number;
}
