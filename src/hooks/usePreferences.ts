
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserPreferences {
  wine_types: string[];
  regions: string[];
  flavor_profiles: string[];
  avoidances: string[];
  default_budget_min: number;
  default_budget_max: number;
  restaurant_budget_min: number;
  restaurant_budget_max: number;
  adventurousness: 'low' | 'medium' | 'high';
  onboarding_completed?: boolean;

  // Spectrum preferences (1-10)
  body_min?: number;
  body_max?: number;
  sweetness_min?: number;
  sweetness_max?: number;
  tannins_min?: number;
  tannins_max?: number;
  acidity_min?: number;
  acidity_max?: number;
  earthiness_min?: number;
  earthiness_max?: number;

  // Varietal preferences map
  varietal_preferences?: Record<string, 'love' | 'neutral' | 'avoid'>;
}

export const PREFS_QUERY_KEY = (userId: string) => ['preferences', userId];

export function usePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences = null, isLoading: loading } = useQuery({
    queryKey: user ? PREFS_QUERY_KEY(user.id) : ['preferences', null],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return (data as UserPreferences | null);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes — preferences change infrequently
  });

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    // Optimistic update into the cache
    queryClient.setQueryData(
      PREFS_QUERY_KEY(user.id),
      (old: UserPreferences | null) => old ? { ...old, ...updates } : (updates as UserPreferences)
    );

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to update preferences:', error);
      // Invalidate so the cache refetches the real server state
      queryClient.invalidateQueries({ queryKey: PREFS_QUERY_KEY(user.id) });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);
    if (error) console.error('Failed to complete onboarding:', error);
  };

  return {
    preferences,
    loading,
    updatePreferences,
    completeOnboarding,
  };
}
