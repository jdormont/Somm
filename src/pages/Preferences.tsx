import { useState, useEffect, useRef } from 'react';
import { Heart, Loader2, Check, X, Store, UtensilsCrossed, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange'];
const REGIONS = [
  'France', 'Italy', 'Spain', 'Portugal', 'Germany', 'Austria',
  'California', 'Oregon', 'Washington', 'New York',
  'Argentina', 'Chile', 'Australia', 'New Zealand', 'South Africa',
  'Greece', 'Georgia', 'Lebanon', 'Japan',
];
const FLAVOR_PROFILES = [
  'Bold & Full-bodied', 'Light & Crisp', 'Fruity', 'Dry', 'Sweet',
  'Earthy', 'Mineral', 'Oaky', 'Tannic', 'Smooth',
  'Floral', 'Herbal', 'Spicy', 'Citrusy', 'Buttery',
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? color === 'wine'
                  ? 'bg-wine-800 text-white shadow-sm'
                  : 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300 hover:text-stone-800'
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

  const [wineTypes, setWineTypes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [flavorProfiles, setFlavorProfiles] = useState<string[]>([]);
  const [avoidances, setAvoidances] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState(15);
  const [budgetMax, setBudgetMax] = useState(50);
  const [restaurantBudgetMin, setRestaurantBudgetMin] = useState(38);
  const [restaurantBudgetMax, setRestaurantBudgetMax] = useState(125);
  const [adventurousness, setAdventurousness] = useState<'low' | 'medium' | 'high'>('medium');
  const restaurantManuallyEdited = useRef(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setWineTypes(data.wine_types || []);
      setRegions(data.regions || []);
      setFlavorProfiles(data.flavor_profiles || []);
      setAvoidances(data.avoidances || []);
      setBudgetMin(data.default_budget_min ?? 15);
      setBudgetMax(data.default_budget_max ?? 50);
      setRestaurantBudgetMin(data.restaurant_budget_min ?? 38);
      setRestaurantBudgetMax(data.restaurant_budget_max ?? 125);
      setAdventurousness(data.adventurousness || 'medium');
      if (data.restaurant_budget_min != null || data.restaurant_budget_max != null) {
        restaurantManuallyEdited.current = true;
      }
    }
    setLoading(false);
  };

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);

    const payload = {
      user_id: user.id,
      wine_types: wineTypes,
      regions,
      flavor_profiles: flavorProfiles,
      avoidances,
      default_budget_min: budgetMin,
      default_budget_max: budgetMax,
      restaurant_budget_min: restaurantBudgetMin,
      restaurant_budget_max: restaurantBudgetMax,
      adventurousness,
      updated_at: new Date().toISOString(),
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
        <Loader2 className="w-6 h-6 text-wine-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-wine-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Your Preferences</h1>
            <p className="text-sm text-stone-500">Help us understand your palate</p>
          </div>
        </div>
        <Link
          to="/knowledge"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-wine-700 bg-wine-50 rounded-xl hover:bg-wine-100 transition-colors"
        >
          <BookOpen size={16} />
          Learn
        </Link>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Wine Types</h2>
          <p className="text-sm text-stone-500 mb-4">Select the types of wine you enjoy most.</p>
          <TagGrid options={WINE_TYPES} selected={wineTypes} onToggle={(v) => toggle(wineTypes, v, setWineTypes)} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Regions</h2>
          <p className="text-sm text-stone-500 mb-4">Pick your favorite wine-producing regions.</p>
          <TagGrid options={REGIONS} selected={regions} onToggle={(v) => toggle(regions, v, setRegions)} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Flavor Profile</h2>
          <p className="text-sm text-stone-500 mb-4">What flavors and characteristics do you prefer?</p>
          <TagGrid options={FLAVOR_PROFILES} selected={flavorProfiles} onToggle={(v) => toggle(flavorProfiles, v, setFlavorProfiles)} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Avoidances</h2>
          <p className="text-sm text-stone-500 mb-4">Anything you'd rather skip?</p>
          <TagGrid options={AVOIDANCES} selected={avoidances} onToggle={(v) => toggle(avoidances, v, setAvoidances)} color="red" />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Adventurousness</h2>
          <p className="text-sm text-stone-500 mb-4">How open are you to trying new or unexpected wines?</p>
          <div className="flex gap-3">
            {([
              { value: 'low' as const, label: 'Play it safe', desc: 'Stick to what I know' },
              { value: 'medium' as const, label: 'Open-minded', desc: 'Similar profiles, new regions' },
              { value: 'high' as const, label: 'Surprise me', desc: 'I love discovering new wines' },
            ]).map((option) => (
              <button
                key={option.value}
                onClick={() => setAdventurousness(option.value)}
                className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${
                  adventurousness === option.value
                    ? 'border-wine-800 bg-wine-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <p className={`text-sm font-medium ${
                  adventurousness === option.value ? 'text-wine-800' : 'text-stone-700'
                }`}>
                  {option.label}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-3">Budget</h2>
          <p className="text-sm text-stone-500 mb-6">Your typical price range per bottle in different settings.</p>

          <div className="space-y-5">
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Store className="w-4 h-4 text-stone-500" />
                <span className="text-sm font-medium text-stone-700">Store / Wine Shop</span>
              </div>
              <div className="flex items-center gap-4">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                  />
                </div>
                <div className="text-stone-300 mt-5">—</div>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                  <span className="text-sm font-medium text-stone-700">Restaurant / Wine Bar</span>
                </div>
                {!restaurantManuallyEdited.current && (
                  <span className="text-xs text-stone-400">Auto ~2.5x store</span>
                )}
              </div>
              <div className="flex items-center gap-4">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                  />
                </div>
                <div className="text-stone-300 mt-5">—</div>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-wine-800 text-white py-3 rounded-xl font-medium text-sm hover:bg-wine-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
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
