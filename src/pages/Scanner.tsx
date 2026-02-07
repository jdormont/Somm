import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, Loader2, Sparkles, DollarSign, MessageSquare, AlertCircle, Store, UtensilsCrossed, Wine } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import RecommendationCard from '../components/RecommendationCard';
import AddWineForm from '../components/AddWineForm';

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
  recommendations: Array<{
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
  }>;
  summary: string;
}

export default function Scanner() {
  const { user, session, profile } = useAuth();
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
  const [selectedWine, setSelectedWine] = useState<any | null>(null);

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
    
    // Only require local API key if not using shared key
    if (!apiKey && !profile?.use_shared_key) {
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

  const handleSelectWine = (wine: any) => {
    setSelectedWine(wine);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {selectedWine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <AddWineForm
              initialData={{
                name: selectedWine.name,
                producer: selectedWine.producer,
                vintage: selectedWine.vintage,
                type: selectedWine.type || 'Red',
                region: selectedWine.region,
                price: selectedWine.price,
                notes: selectedWine.tasting_notes,
              }}
              onAdd={() => {
                setSelectedWine(null);
                navigate('/cellar');
              }}
              onCancel={() => setSelectedWine(null)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-somm-red-900/20 flex items-center justify-center border border-somm-red-500/20">
          <ScanLine className="w-5 h-5 text-somm-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-champagne-100">Wine Scanner</h1>
          <p className="text-sm font-light text-stone-400">Snap a wine list and get instant picks</p>
        </div>
      </div>

      {!result ? (
        <div className="space-y-6">
          <section className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-inner">
            <label className="block text-sm font-medium text-champagne-100 mb-4 uppercase tracking-wider">
              Wine List or Bottle Photo
            </label>
            <ImageUpload
              onImageReady={setImageBase64}
              imagePreview={imageBase64}
              onClear={() => setImageBase64(null)}
            />
          </section>

          <section className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <label className="block text-sm font-medium text-champagne-100 mb-4 uppercase tracking-wider">
              Where are you shopping?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setContext('store')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 group ${
                  context === 'store'
                    ? 'border-champagne-400 bg-champagne-400/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Store className={`w-5 h-5 transition-colors ${context === 'store' ? 'text-champagne-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium transition-colors ${context === 'store' ? 'text-champagne-100' : 'text-stone-400 group-hover:text-stone-200'}`}>Store</p>
                  <p className="text-xs text-stone-500">Wine shop or retail</p>
                </div>
              </button>
              <button
                onClick={() => setContext('restaurant')}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 group ${
                  context === 'restaurant'
                    ? 'border-champagne-400 bg-champagne-400/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <UtensilsCrossed className={`w-5 h-5 transition-colors ${context === 'restaurant' ? 'text-champagne-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                <div className="text-left">
                  <p className={`text-sm font-medium transition-colors ${context === 'restaurant' ? 'text-champagne-100' : 'text-stone-400 group-hover:text-stone-200'}`}>Restaurant</p>
                  <p className="text-xs text-stone-500">Wine list or bar</p>
                </div>
              </button>
            </div>
          </section>

          <section className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <label className="block text-sm font-medium text-champagne-100 mb-4 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-stone-400" />
                Budget Range
                <span className="text-xs font-normal text-stone-500 lowercase ml-1">
                  ({context === 'store' ? 'Store' : 'Restaurant'} pricing)
                </span>
              </span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                    placeholder="Min"
                  />
                </div>
              </div>
              <span className="text-stone-500 hidden sm:inline font-light">to</span>
              <div className="flex-1">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    min={0}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
            <label className="block text-sm font-medium text-champagne-100 mb-4 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-stone-400" />
                Additional Notes
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Pairing with grilled salmon, celebrating an anniversary, want something adventurous..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm resize-none backdrop-blur-sm"
            />
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-200">{error}</p>
                {error.includes('API key') && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-sm text-red-300 font-medium underline mt-1 hover:text-red-100"
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
            className="w-full bg-somm-red-900/90 text-champagne-100 py-4 rounded-xl font-medium text-sm hover:bg-somm-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-somm-red-900/40 border border-somm-red-500/30 group"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing wine list...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-champagne-400 group-hover:text-white transition-colors" />
                Get recommendations
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {result.summary && (
            <div className="bg-somm-red-900/10 border border-somm-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Wine className="w-24 h-24 text-somm-red-500" />
                </div>
              <p className="text-sm text-champagne-100 leading-relaxed relative z-10">{result.summary}</p>
            </div>
          )}

          {result.wines_detected && result.wines_detected.length > 0 && (
            <div className="text-xs font-medium text-stone-500 tracking-wide uppercase text-center">
              {result.wines_detected.length} wine{result.wines_detected.length !== 1 ? 's' : ''} detected
              {' • '}
              {result.recommendations.length} recommendation{result.recommendations.length !== 1 ? 's' : ''}
            </div>
          )}

          <div className="space-y-6">
            {result.recommendations.map((wine, i) => (
              <RecommendationCard
                key={`${wine.name}-${i}`}
                name={wine.name}
                type={wine.type}
                region={wine.region}
                matchScore={wine.match_score}
                reason={wine.reasoning}
                priceRange={wine.price ? `$${wine.price}` : undefined}
                className="w-full"
                onSelect={() => handleSelectWine(wine)}
              />
            ))}
          </div>

          <button
            onClick={handleNewScan}
            className="w-full bg-white/5 text-stone-300 border border-white/10 py-3.5 rounded-xl font-medium text-sm hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 hover:border-white/20"
          >
            <ScanLine className="w-4 h-4" />
            Scan another list
          </button>
        </div>
      )}
    </div>
  );
}
