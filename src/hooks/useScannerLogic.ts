import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCreateScan, useAnalyzeWine } from './useScans';
import { ScanResult, ContextType, WineInput } from '../types';

const API_KEY_STORAGE_KEY = 'somm_openai_api_key';

export function useScannerLogic() {
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [context, setContext] = useState<ContextType>('store');
  const [storeBudgetMin, setStoreBudgetMin] = useState<number | ''>(15);
  const [storeBudgetMax, setStoreBudgetMax] = useState<number | ''>(50);
  const [restaurantBudgetMin, setRestaurantBudgetMin] = useState<number | ''>(38);
  const [restaurantBudgetMax, setRestaurantBudgetMax] = useState<number | ''>(125);
  const [notes, setNotes] = useState('');
  const [foodPairing, setFoodPairing] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedWine, setSelectedWine] = useState<WineInput | null>(null);

  // Mutations
  const createScan = useCreateScan();
  const analyzeWine = useAnalyzeWine();

  const analyzing = analyzeWine.isPending || createScan.isPending;

  // Derived state
  const budgetMin = context === 'store' ? storeBudgetMin : restaurantBudgetMin;
  const budgetMax = context === 'store' ? storeBudgetMax : restaurantBudgetMax;
  
  // Setters for derived state (proxy to underlying state)
  const setBudgetMin = context === 'store' ? setStoreBudgetMin : setRestaurantBudgetMin;
  const setBudgetMax = context === 'store' ? setStoreBudgetMax : setRestaurantBudgetMax;

  // Load defaults on mount
  useEffect(() => {
    async function loadDefaults() {
      if (!user) return;
      const { data } = await supabase
        .from('user_preferences')
        .select('default_budget_min, default_budget_max, restaurant_budget_min, restaurant_budget_max')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setStoreBudgetMin(data.default_budget_min ?? 15);
        setStoreBudgetMax(data.default_budget_max ?? 50);
        setRestaurantBudgetMin(data.restaurant_budget_min ?? 38);
        setRestaurantBudgetMax(data.restaurant_budget_max ?? 125);
      }
    }
    loadDefaults();
  }, [user]);

  const handleAnalyze = async () => {
    if (!imageBase64 || !user || !session) return;

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    
    // Only require local API key if not using shared key
    if (!apiKey && !profile?.use_shared_key) {
      setError('Please add your OpenAI API key in Settings first.');
      return;
    }

    setError('');
    setResult(null);

    const finalBudgetMin = budgetMin === '' ? 0 : budgetMin;
    const finalBudgetMax = budgetMax === '' ? 0 : budgetMax;

    try {
      // Fetch prefs and memories
      const [{ data: prefs }, { data: memories }] = await Promise.all([
        supabase
          .from('user_preferences')
          .select('wine_types, regions, flavor_profiles, avoidances, adventurousness')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('wine_memories')
          .select('name, producer, vintage, type, region, rating, notes')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      const preferences = {
        wine_types: prefs?.wine_types || [],
        regions: prefs?.regions || [],
        flavor_profiles: prefs?.flavor_profiles || [],
        avoidances: prefs?.avoidances || [],
        adventurousness: prefs?.adventurousness || 'medium',
      };

      // 1. Analyze
      const scanResult = await analyzeWine.mutateAsync({
        payload: {
          image_base64: imageBase64,
          preferences,
          wine_memories: memories || [],
          budget_min: finalBudgetMin,
          budget_max: finalBudgetMax,
          context,
          notes,
          food_context: foodPairing,
          openai_api_key: apiKey,
        },
      });

      setResult(scanResult);

      // 2. Save Session
      await createScan.mutateAsync({
        user_id: user.id,
        budget_min: finalBudgetMin,
        budget_max: finalBudgetMax,
        context,
        notes: foodPairing ? `[Food: ${foodPairing}] ${notes}` : notes,
        wines_detected: scanResult.wines_detected || [],
        recommendations: scanResult.recommendations || [],
        summary: scanResult.summary || '',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleNewScan = () => {
    setImageBase64(null);
    setResult(null);
    setError('');
    setNotes('');
    setFoodPairing('');
  };

  return {
    state: {
      imageBase64,
      context,
      budgetMin,
      budgetMax,
      notes,
      foodPairing,
      error,
      result,
      selectedWine,
      analyzing
    },
    actions: {
      setImageBase64,
      setContext,
      setBudgetMin,
      setBudgetMax,
      setNotes,
      setFoodPairing,
      handleAnalyze,
      handleNewScan,
      setSelectedWine,
      navigate // exporting navigate for the form completion
    }
  };
}
