import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from './usePreferences';
import { useCreateScan, useAnalyzeWine } from './useScans';
import { ScanResult, ContextType, WineInput } from '../types';

const API_KEY_STORAGE_KEY = 'somm_openai_api_key';

export function useScannerLogic() {
  const { user, session, profile } = useAuth();
  const { preferences: cachedPrefs } = usePreferences();
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

  // Populate budget defaults from the shared preferences cache
  useEffect(() => {
    if (!cachedPrefs) return;
    setStoreBudgetMin(cachedPrefs.default_budget_min ?? 15);
    setStoreBudgetMax(cachedPrefs.default_budget_max ?? 50);
    setRestaurantBudgetMin(cachedPrefs.restaurant_budget_min ?? 38);
    setRestaurantBudgetMax(cachedPrefs.restaurant_budget_max ?? 125);
  }, [cachedPrefs]);

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
      // Fetch wine memories fresh; preferences come from the shared React Query cache
      const { data: memories } = await supabase
        .from('wine_memories')
        .select('name, producer, vintage, type, region, rating, notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      const prefs = cachedPrefs;
      const preferences = {
        wine_types: prefs?.wine_types || [],
        regions: prefs?.regions || [],
        flavor_profiles: prefs?.flavor_profiles || [],
        avoidances: prefs?.avoidances || [],
        adventurousness: prefs?.adventurousness || 'medium',
        // Spectrum Preferences
        body: { min: prefs?.body_min ?? 1, max: prefs?.body_max ?? 10 },
        sweetness: { min: prefs?.sweetness_min ?? 1, max: prefs?.sweetness_max ?? 10 },
        tannins: { min: prefs?.tannins_min ?? 1, max: prefs?.tannins_max ?? 10 },
        acidity: { min: prefs?.acidity_min ?? 1, max: prefs?.acidity_max ?? 10 },
        earthiness: { min: prefs?.earthiness_min ?? 1, max: prefs?.earthiness_max ?? 10 },
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
        debug_info: scanResult.debug,
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
