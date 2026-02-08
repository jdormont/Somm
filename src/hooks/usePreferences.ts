
import { useState, useEffect } from 'react';
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
}

export function usePreferences() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  const loadPreferences = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPreferences(data);
    }
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;
    
    // Optimistic update
    setPreferences(prev => prev ? { ...prev, ...updates } : updates as UserPreferences);

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      // Revert or handle error
      console.error('Failed to update preferences:', error);
      loadPreferences(); // Reload from server on error
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    // Update local state first
    // Note: This relies on user_profiles, not user_preferences table for the flag
    const { error } = await supabase
      .from('user_profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);

    if (error) console.error('Failed to complete onboarding:', error);
  };

  useEffect(() => {
    loadPreferences();
  }, [user]);

  return {
    preferences,
    loading,
    updatePreferences,
    completeOnboarding
  };
}
