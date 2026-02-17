import { useState, useEffect, useRef } from 'react';
import { Heart, Loader2, Check, X, Store, UtensilsCrossed, BookOpen, ChevronDown, ChevronUp, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import TasteSlider from '../components/TasteSlider';
import TasteCalibrator from '../components/TasteCalibrator';
import { useTasteCalibration, TasteAnchor } from '../hooks/useTasteCalibration';

const WINE_VARIETALS: Record<string, string[]> = {
  Red: ['Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah/Shiraz', 'Malbec', 'Zinfandel', 'Sangiovese', 'Nebbiolo', 'Grenache', 'Tempranillo'],
  White: ['Chardonnay', 'Sauvignon Blanc', 'Pinot Grigio', 'Riesling', 'Chenin Blanc', 'Moscato', 'Gewürztraminer', 'Viognier', 'Grüner Veltliner'],
  Rosé: ['Provencal Rosé', 'White Zinfandel', 'Syrah Rosé', 'Grenache Rosé', 'Sangiovese Rosé'],
  Sparkling: ['Champagne', 'Prosecco', 'Cava', 'Lambrusco', 'Franciacorta', 'Crémant'],
  Dessert: ['Port', 'Sherry', 'Ice Wine', 'Sauternes', 'Moscato d\'Asti'],
  Fortified: ['Port', 'Sherry', 'Madeira', 'Marsala', 'Vermouth'],
  Orange: ['Skin-Contact White', 'Amber Wine']
};

const REGIONS = [
  'France', 'Italy', 'Spain', 'Portugal', 'Germany', 'Austria',
  'California', 'Oregon', 'Washington', 'New York',
  'Argentina', 'Chile', 'Australia', 'New Zealand', 'South Africa',
  'Greece', 'Georgia', 'Lebanon', 'Japan',
];

const AVOIDANCES = [
  'High tannins', 'Very sweet', 'High alcohol', 'Heavy oak',
  'Sulfites', 'Very acidic', 'Cheap blends',
];

function TagGrid({
  options,
  selected,
  onToggle,
  color = 'wine',
}: {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
  color?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              isSelected
                ? color === 'wine'
                  ? 'bg-champagne-400 text-wine-900 shadow-sm shadow-champagne-400/20'
                  : 'bg-red-500/20 text-red-200 border border-red-500/30'
                : 'bg-white/5 text-stone-400 border border-white/10 hover:border-white/20 hover:text-stone-200 hover:bg-white/10'
            }`}
          >
            {isSelected && (color === 'wine' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />)}
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default function Preferences() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [regions, setRegions] = useState<string[]>([]);
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(15);
  const [budgetMax, setBudgetMax] = useState(50);
  const [restaurantBudgetMin, setRestaurantBudgetMin] = useState(38);
  const [restaurantBudgetMax, setRestaurantBudgetMax] = useState(125);
  const [adventurousness, setAdventurousness] = useState<'low' | 'medium' | 'high'>('medium');
  const restaurantManuallyEdited = useRef(false);

  // New preferences
  const [bodyRange, setBodyRange] = useState<[number, number]>([1, 10]);
  const [sweetnessRange, setSweetnessRange] = useState<[number, number]>([1, 10]);
  const [tanninsRange, setTanninsRange] = useState<[number, number]>([1, 10]);
  const [acidityRange, setAcidityRange] = useState<[number, number]>([1, 10]);
  const [earthinessRange, setEarthinessRange] = useState<[number, number]>([1, 10]);
  
  const [varietalPreferences, setVarietalPreferences] = useState<Record<string, 'love' | 'neutral' | 'avoid'>>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Taste Anchors
  const [anchors, setAnchors] = useState<TasteAnchor[]>([]);
  const { suggestedProfile } = useTasteCalibration(anchors);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    // Load anchors
    const { data: anchorsData } = await supabase
        .from('user_taste_anchors')
        .select('*')
        .eq('user_id', user.id);
        
    setAnchors(anchorsData || []);

    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setRegions(data.regions || []);
      setAvoidances(data.avoidances || []);
      setBudgetMin(data.default_budget_min ?? 15);
      setBudgetMax(data.default_budget_max ?? 50);
      setRestaurantBudgetMin(data.restaurant_budget_min ?? 38);
      setRestaurantBudgetMax(data.restaurant_budget_max ?? 125);
      setAdventurousness(data.adventurousness || 'medium');
      if (data.restaurant_budget_min != null || data.restaurant_budget_max != null) {
        restaurantManuallyEdited.current = true;
      }

      // Load new fields
      setBodyRange([data.body_min ?? 1, data.body_max ?? 10]);
      setSweetnessRange([data.sweetness_min ?? 1, data.sweetness_max ?? 10]);
      setTanninsRange([data.tannins_min ?? 1, data.tannins_max ?? 10]);
      setAcidityRange([data.acidity_min ?? 1, data.acidity_max ?? 10]);
      setEarthinessRange([data.earthiness_min ?? 1, data.earthiness_max ?? 10]);
      setVarietalPreferences(data.varietal_preferences || {});
    }
    setLoading(false);
  };

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };


  const handleApplyCalibration = () => {
      if (!suggestedProfile) return;
      
      // Helper to create a range centered on the calibrated value
      const setRange = (val: number) => {
          const min = Math.max(1, val - 1);
          const max = Math.min(10, val + 1);
          return [min, max] as [number, number];
      };

      setBodyRange(setRange(suggestedProfile.body));
      setSweetnessRange(setRange(suggestedProfile.sweetness));
      setTanninsRange(setRange(suggestedProfile.tannins));
      setAcidityRange(setRange(suggestedProfile.acidity));
      setEarthinessRange(setRange(suggestedProfile.earthiness));
  };

  const cycleVarietalPreference = (varietal: string) => {
    setVarietalPreferences(prev => {
      const current = prev[varietal] || 'neutral';
      let next: 'love' | 'neutral' | 'avoid' = 'neutral';
      if (current === 'neutral') next = 'love';
      else if (current === 'love') next = 'avoid';
      else if (current === 'avoid') next = 'neutral';
      
      const newPrefs = { ...prev };
      if (next === 'neutral') {
        delete newPrefs[varietal];
      } else {
        newPrefs[varietal] = next;
      }
      return newPrefs;
    });
  };

  const getVarietalIcon = (status?: string) => {
    switch (status) {
      case 'love': return <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />;
      case 'avoid': return <X className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-stone-600" />;
    }
  };
  
  const getVarietalClass = (status?: string) => {
    switch (status) {
      case 'love': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100';
      case 'avoid': return 'bg-red-500/10 border-red-500/30 text-red-100';
      default: return 'bg-white/5 border-white/5 text-stone-400 hover:bg-white/10';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    const payload = {
      user_id: user.id,
      regions,
      avoidances,
      default_budget_min: budgetMin,
      default_budget_max: budgetMax,
      restaurant_budget_min: restaurantBudgetMin,
      restaurant_budget_max: restaurantBudgetMax,
      adventurousness,
      updated_at: new Date().toISOString(),
      
      // New fields
      body_min: bodyRange[0], body_max: bodyRange[1],
      sweetness_min: sweetnessRange[0], sweetness_max: sweetnessRange[1],
      tannins_min: tanninsRange[0], tannins_max: tanninsRange[1],
      acidity_min: acidityRange[0], acidity_max: acidityRange[1],
      earthiness_min: earthinessRange[0], earthiness_max: earthinessRange[1],
      varietal_preferences: varietalPreferences,
    };

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase.from('user_preferences').update(payload).eq('user_id', user.id);
    } else {
      await supabase.from('user_preferences').insert(payload);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-champagne-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-somm-red-900/20 flex items-center justify-center border border-somm-red-500/20">
            <Heart className="w-5 h-5 text-somm-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-champagne-100">Your Preferences</h1>
            <p className="text-sm font-light text-stone-400">Help us understand your palate</p>
          </div>
        </div>
        <Link
          to="/knowledge"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-champagne-100 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
        >
          <BookOpen size={16} />
          Learn
        </Link>
      </div>

      <div className="space-y-12">
        {/* Taste Calibrator */}
        <TasteCalibrator 
            anchors={anchors} 
            onAnchorsChange={(newAnchors) => {
                setAnchors(newAnchors);
                // Optionally auto-calibrate on add
                if (newAnchors.length > anchors.length) {
                    // We need to wait for the next render for suggestedProfile to update?
                    // Actually the hook updates immediately if we pass the new anchors to it, 
                    // but here we are setting state.
                    // We can rely on the user clicking "Apply" or "Recalibrate" for now to be explicit,
                    // or use a separate effect. 
                    // For now, let's just update the list. The user can click Recalibrate.
                    // Or we can call handleApplyCalibration in an effect.
                }
            }}
            onApplyCalibration={handleApplyCalibration}
        />

        {/* Flavor Profile Section */}
        <section className="space-y-6">

          <div className="border-b border-white/10 pb-4">
            <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-1">Flavor Profile</h2>
            <p className="text-sm text-stone-500">Define your ideal range for each characteristic.</p>
          </div>
          
          <div className="space-y-8 px-2">
            <TasteSlider
              label="Body"
              leftLabel="Light"
              rightLabel="Full"
              value={bodyRange}
              onChange={setBodyRange}
            />
            <TasteSlider
              label="Sweetness"
              leftLabel="Bone Dry"
              rightLabel="Sweet"
              value={sweetnessRange}
              onChange={setSweetnessRange}
            />
             <TasteSlider
              label="Tannins"
              leftLabel="Smooth"
              rightLabel="Grippy"
              value={tanninsRange}
              onChange={setTanninsRange}
            />
             <TasteSlider
              label="Acidity"
              leftLabel="Soft"
              rightLabel="Zesty"
              value={acidityRange}
              onChange={setAcidityRange}
            />
             <TasteSlider
              label="Earthiness"
              leftLabel="Fruit-Forward"
              rightLabel="Savory/Earthy"
              value={earthinessRange}
              onChange={setEarthinessRange}
            />
          </div>
        </section>

        {/* Wine Types Section */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-1">Wine Types</h2>
            <p className="text-sm text-stone-500">Tell us which varietals you love or avoid.</p>
          </div>
          
          <div className="space-y-3">
            {Object.entries(WINE_VARIETALS).map(([category, varietals]) => {
              const isExpanded = expandedCategories.includes(category);
              const activeCount = varietals.filter(v => varietalPreferences[v]).length;
              
              return (
                <div key={category} className="border border-white/5 rounded-2xl overflow-hidden bg-white/5">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-champagne-100">{category}</span>
                      {activeCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-somm-red-500/20 text-somm-red-200 border border-somm-red-500/30">
                          {activeCount} set
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                      {varietals.map(varietal => {
                        const status = varietalPreferences[varietal];
                        return (
                          <button
                            key={varietal}
                            onClick={() => cycleVarietalPreference(varietal)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${getVarietalClass(status)}`}
                          >
                            <span className="text-sm font-medium">{varietal}</span>
                            <div className="ml-2 pt-1">{getVarietalIcon(status)}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Regions */}
        <section>
          <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-3">Regions</h2>
          <p className="text-sm text-stone-500 mb-4">Pick your favorite wine-producing regions.</p>
          <TagGrid options={REGIONS} selected={regions} onToggle={(v) => toggle(regions, v, setRegions)} />
        </section>

        {/* Avoidances */}
        <section>
          <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-3">Avoidances</h2>
          <p className="text-sm text-stone-500 mb-4">Anything you'd rather skip?</p>
          <TagGrid options={AVOIDANCES} selected={avoidances} onToggle={(v) => toggle(avoidances, v, setAvoidances)} color="red" />
        </section>

        {/* Adventurousness */}
        <section>
          <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-3">Adventurousness</h2>
          <p className="text-sm text-stone-500 mb-4">How open are you to trying new or unexpected wines?</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {([
              { value: 'low' as const, label: 'Play it safe', desc: 'Stick to what I know' },
              { value: 'medium' as const, label: 'Open-minded', desc: 'Similar profiles, new regions' },
              { value: 'high' as const, label: 'Surprise me', desc: 'I love discovering new wines' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => setAdventurousness(option.value)}
                className={`flex-1 p-4 rounded-xl border text-left transition-all duration-300 ${
                  adventurousness === option.value
                    ? 'border-champagne-400 bg-champagne-400/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <p className={`text-sm font-medium transition-colors ${
                  adventurousness === option.value ? 'text-champagne-100' : 'text-stone-400'
                }`}>
                  {option.label}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Budget */}
        <section>
          <h2 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider mb-3">Budget</h2>
          <p className="text-sm text-stone-500 mb-6">Your typical price range per bottle in different settings.</p>

          <div className="space-y-5">
            <div className="bg-wine-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-stone-500" />
                <span className="text-sm font-medium text-champagne-100">Store / Wine Shop</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBudgetMin(val);
                      if (!restaurantManuallyEdited.current) {
                        setRestaurantBudgetMin(Math.round(val * 2.5));
                      }
                    }}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                  />
                </div>
                <div className="text-stone-600 hidden sm:block sm:mt-5">—</div>
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBudgetMax(val);
                      if (!restaurantManuallyEdited.current) {
                        setRestaurantBudgetMax(Math.round(val * 2.5));
                      }
                    }}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-wine-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-champagne-100">Restaurant / Wine Bar</span>
                </div>
                {!restaurantManuallyEdited.current && (
                  <span className="text-xs text-stone-500">Auto ~2.5x store</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1">Min ($)</label>
                  <input
                    type="number"
                    value={restaurantBudgetMin}
                    onChange={(e) => {
                      restaurantManuallyEdited.current = true;
                      setRestaurantBudgetMin(Number(e.target.value));
                    }}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                  />
                </div>
                <div className="text-stone-600 hidden sm:block sm:mt-5">—</div>
                <div className="flex-1">
                  <label className="block text-xs text-stone-500 mb-1">Max ($)</label>
                  <input
                    type="number"
                    value={restaurantBudgetMax}
                    onChange={(e) => {
                      restaurantManuallyEdited.current = true;
                      setRestaurantBudgetMax(Number(e.target.value));
                    }}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/20 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-somm-red-900/90 text-champagne-100 py-4 rounded-xl font-medium text-sm hover:bg-somm-red-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-somm-red-500/30 shadow-lg hover:shadow-somm-red-900/20 group"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              Saved!
            </>
          ) : (
            'Save preferences'
          )}
        </button>
      </div>
    </div>
  );
}
