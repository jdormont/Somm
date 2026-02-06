import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Loader2, Sparkles, DollarSign, MessageSquare, AlertCircle, Store, UtensilsCrossed } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import WineCard, { type WineRecommendation } from '../components/WineCard';

const API_KEY_STORAGE_KEY = 'somm_openai_api_key';

interface ScanResult {
  wines_detected: Array<{
    name: string;
    producer: string | null;
    vintage: string | null;
    type: string;
    region: string | null;
    price: number | null;
  }>;
  recommendations: WineRecommendation[];
  summary: string;
}

export default function Scanner() {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [context, setContext] = useState<'store' | 'restaurant'>('store');
  const [storeBudgetMin, setStoreBudgetMin] = useState(15);
  const [storeBudgetMax, setStoreBudgetMax] = useState(50);
  const [restaurantBudgetMin, setRestaurantBudgetMin] = useState(38);
  const [restaurantBudgetMax, setRestaurantBudgetMax] = useState(125);
  const [notes, setNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const budgetMin = context === 'store' ? storeBudgetMin : restaurantBudgetMin;
  const budgetMax = context === 'store' ? storeBudgetMax : restaurantBudgetMax;
  const setBudgetMin = context === 'store' ? setStoreBudgetMin : setRestaurantBudgetMin;
  const setBudgetMax = context === 'store' ? setStoreBudgetMax : setRestaurantBudgetMax;

  useEffect(() => {
    loadDefaults();
  }, [user]);

  const loadDefaults = async () => {
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
  };

  const handleAnalyze = async () => {
    if (!imageBase64 || !user || !session) return;

    const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (!apiKey) {
      setError('Please add your OpenAI API key in Settings first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
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
          .limit(30),
      ]);

      const preferences = {
        wine_types: prefs?.wine_types || [],
        regions: prefs?.regions || [],
        flavor_profiles: prefs?.flavor_profiles || [],
        avoidances: prefs?.avoidances || [],
        adventurousness: prefs?.adventurousness || 'medium',
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-wine`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_base64: imageBase64,
          preferences,
          wine_memories: memories || [],
          budget_min: budgetMin,
          budget_max: budgetMax,
          context,
          notes,
          openai_api_key: apiKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);

      await supabase.from('scan_sessions').insert({
        user_id: user.id,
        budget_min: budgetMin,
        budget_max: budgetMax,
        context,
        notes,
        wines_detected: data.wines_detected || [],
        recommendations: data.recommendations || [],
        summary: data.summary || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setImageBase64(null);
    setResult(null);
    setError('');
    setNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center">
          <ScanLine className="w-5 h-5 text-wine-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Wine Scanner</h1>
          <p className="text-sm text-stone-500">Snap a wine list and get instant picks</p>
        </div>
      </div>

      {!result ? (
        <div className="space-y-6">
          <section>
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Wine List or Bottle Photo
            </label>
            <ImageUpload
              onImageReady={setImageBase64}
              imagePreview={imageBase64}
              onClear={() => setImageBase64(null)}
            />
          </section>

          <section>
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              Where are you shopping?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setContext('store')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  context === 'store'
                    ? 'border-wine-800 bg-wine-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <Store className={`w-5 h-5 ${context === 'store' ? 'text-wine-800' : 'text-stone-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${context === 'store' ? 'text-wine-800' : 'text-stone-700'}`}>Store</p>
                  <p className="text-xs text-stone-500">Wine shop or retail</p>
                </div>
              </button>
              <button
                onClick={() => setContext('restaurant')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  context === 'restaurant'
                    ? 'border-wine-800 bg-wine-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <UtensilsCrossed className={`w-5 h-5 ${context === 'restaurant' ? 'text-wine-800' : 'text-stone-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium ${context === 'restaurant' ? 'text-wine-800' : 'text-stone-700'}`}>Restaurant</p>
                  <p className="text-xs text-stone-500">Wine list or bar</p>
                </div>
              </button>
            </div>
          </section>

          <section>
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-stone-500" />
                Budget Range
                <span className="text-xs font-normal text-stone-400">
                  ({context === 'store' ? 'Store' : 'Restaurant'} pricing)
                </span>
              </span>
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                    placeholder="Min"
                  />
                </div>
              </div>
              <span className="text-stone-300">to</span>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <label className="block text-sm font-semibold text-stone-900 mb-3">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-stone-500" />
                Additional Notes
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Pairing with grilled salmon, celebrating an anniversary, want something adventurous..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm resize-none"
            />
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('API key') && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-sm text-red-800 font-medium underline mt-1 hover:text-red-900"
                  >
                    Go to Settings
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imageBase64 || analyzing}
            className="w-full bg-wine-800 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-wine-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:shadow-wine-800/10"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing wine list...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Get recommendations
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {result.summary && (
            <div className="bg-wine-50 border border-wine-100 rounded-2xl p-5">
              <p className="text-sm text-wine-800 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {result.wines_detected && result.wines_detected.length > 0 && (
            <div className="text-sm text-stone-500">
              {result.wines_detected.length} wine{result.wines_detected.length !== 1 ? 's' : ''} detected
              {' / '}
              {result.recommendations.length} recommendation{result.recommendations.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="space-y-4">
            {result.recommendations.map((wine, i) => (
              <WineCard key={`${wine.name}-${i}`} wine={wine} index={i} />
            ))}
          </div>

          <button
            onClick={handleNewScan}
            className="w-full bg-white text-stone-700 border border-stone-200 py-3 rounded-xl font-medium text-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
          >
            <ScanLine className="w-4 h-4" />
            Scan another list
          </button>
        </div>
      )}
    </div>
  );
}
