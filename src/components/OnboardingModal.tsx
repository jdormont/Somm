import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wine, Sparkles, X, ChevronRight, Check, Store, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

interface OnboardingModalProps {
  onComplete: () => void;
}

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

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = Welcome, 1-6 = Wizard
  const [loading, setLoading] = useState(false);

  // Wizard State
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

  const handleScanNow = async () => {
    setLoading(true);
    // Mark onboarding as complete even if they skip the detailed profile
    await completeOnboarding();
    navigate('/scan');
  };

  const handleStartProfile = () => {
    setStep(1);
  };

  const completeOnboarding = async () => {
    if (!user) return;
    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
      
      onComplete(); // Notify parent to close modal
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    setLoading(true);

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

    // Upsert preferences
    const { error } = await supabase.from('user_preferences').upsert(payload, { onConflict: 'user_id' });
    
    if (error) {
       console.error("Error saving preferences:", error);
       // Handle error UI?
    } else {
       await completeOnboarding();
    }
    setLoading(false);
  };

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const renderWelcome = () => (
    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif text-champagne-100">Welcome to Somm</h2>
        <p className="text-stone-400">Your personal AI wine sommelier is ready.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={handleScanNow}
          className="group relative flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:border-champagne-400/30 text-center space-y-4"
        >
          <div className="p-4 rounded-full bg-somm-red-900/20 text-somm-red-400 group-hover:text-somm-red-300 transition-colors">
            <Wine className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-champagne-100">Scan Now</h3>
            <p className="text-sm text-stone-500 mt-1">I'm at a shop or restaurant effectively immediately.</p>
          </div>
        </button>

        <button
          onClick={handleStartProfile}
          className="group relative flex flex-col items-center p-6 bg-somm-red-900/20 border border-somm-red-500/20 rounded-2xl hover:bg-somm-red-900/30 transition-all hover:border-somm-red-500/40 text-center space-y-4"
        >
          <div className="p-4 rounded-full bg-champagne-400/10 text-champagne-400 group-hover:text-champagne-300 transition-colors">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-champagne-100">Build Profile</h3>
            <p className="text-sm text-stone-500 mt-1">Teach Somm your tastes for better recommendations.</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderWizardStep = () => {
    switch (step) {
      case 1: // Wine Types
        return (
          <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Favorite Styles</h3>
            <p className="text-sm text-stone-500 mb-6">Select the types of wine you generally enjoy.</p>
            <TagGrid options={WINE_TYPES} selected={wineTypes} onToggle={(v) => toggle(wineTypes, v, setWineTypes)} />
          </>
        );
      case 2: // Regions
        return (
          <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Regions</h3>
            <p className="text-sm text-stone-500 mb-6">Any specific regions you love?</p>
            <TagGrid options={REGIONS} selected={regions} onToggle={(v) => toggle(regions, v, setRegions)} />
          </>
        );
      case 3: // Flavor Profile
        return (
          <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Flavor Profile</h3>
            <p className="text-sm text-stone-500 mb-6">What characteristics do you look for?</p>
            <TagGrid options={FLAVOR_PROFILES} selected={flavorProfiles} onToggle={(v) => toggle(flavorProfiles, v, setFlavorProfiles)} />
          </>
        );
      case 4: // Avoidances
        return (
          <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Avoidances</h3>
            <p className="text-sm text-stone-500 mb-6">Anything you absolutely dislike?</p>
            <TagGrid options={AVOIDANCES} selected={avoidances} onToggle={(v) => toggle(avoidances, v, setAvoidances)} color="red" />
          </>
        );
      case 5: // Adventurousness
        return (
          <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Adventurousness</h3>
            <p className="text-sm text-stone-500 mb-6">How open are you to trying new things?</p>
            <div className="space-y-3">
              {[
                { value: 'low' as const, label: 'Play it safe', desc: 'Stick to what I know' },
                { value: 'medium' as const, label: 'Open-minded', desc: 'Similar profiles, new regions' },
                { value: 'high' as const, label: 'Surprise me', desc: 'I love discovering new wines' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAdventurousness(option.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-300 ${
                    adventurousness === option.value
                      ? 'border-champagne-400 bg-champagne-400/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                        <p className={`text-sm font-medium transition-colors ${
                          adventurousness === option.value ? 'text-champagne-100' : 'text-stone-400'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">{option.desc}</p>
                    </div>
                    {adventurousness === option.value && <Check className="w-4 h-4 text-champagne-400" />}
                  </div>
                </button>
              ))}
            </div>
          </>
        );
      case 6: // Budget
        return (
           <>
            <h3 className="text-lg font-medium text-champagne-100 mb-2">Typical Budget</h3>
            <p className="text-sm text-stone-500 mb-6">What's your comfortable price range?</p>
            {/* Store Budget */}
            <div className="bg-wine-slate-900/50 rounded-xl p-4 border border-white/5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <Store className="w-4 h-4 text-stone-500" />
                    <span className="text-sm font-medium text-champagne-100">Store ($)</span>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={budgetMin}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setBudgetMin(val);
                            if (!restaurantManuallyEdited.current) setRestaurantBudgetMin(Math.round(val * 2.5));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-champagne-100"
                        placeholder="Min"
                    />
                    <span className="text-stone-600">-</span>
                    <input
                        type="number"
                        value={budgetMax}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setBudgetMax(val);
                            if (!restaurantManuallyEdited.current) setRestaurantBudgetMax(Math.round(val * 2.5));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-champagne-100"
                        placeholder="Max"
                    />
                </div>
            </div>

            {/* Restaurant Budget */}
             <div className="bg-wine-slate-900/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4 text-stone-500" />
                        <span className="text-sm font-medium text-champagne-100">Restaurant ($)</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        id="restaurant-budget-min"
                        aria-label="Restaurant Minimum Budget"
                        value={restaurantBudgetMin}
                        onChange={(e) => {
                            restaurantManuallyEdited.current = true;
                            setRestaurantBudgetMin(Number(e.target.value));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-champagne-100"
                    />
                    <span className="text-stone-600">-</span>
                    <input
                        type="number"
                        id="restaurant-budget-max"
                        aria-label="Restaurant Maximum Budget"
                        value={restaurantBudgetMax}
                        onChange={(e) => {
                             restaurantManuallyEdited.current = true;
                             setRestaurantBudgetMax(Number(e.target.value));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-champagne-100"
                    />
                </div>
            </div>
           </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-wine-slate-950 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={() => {
            localStorage.setItem('somm_onboarding_dismissed', 'true');
            onComplete();
            navigate('/scan');
          }}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-white transition-colors"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>
        
        {step > 0 && (
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? 'w-6 bg-champagne-400' : 'w-2 bg-white/10'}`} />
                    ))}
                </div>
             </div>
          </div>
        )}

        <div className="min-h-[300px] flex flex-col justify-center">
            {step === 0 ? renderWelcome() : renderWizardStep()}
        </div>

        {step > 0 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-stone-500 hover:text-stone-300 text-sm font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (step < 6) setStep(s => s + 1);
                else savePreferences();
              }}
              disabled={loading}
              className="bg-champagne-400 text-wine-950 px-6 py-2 rounded-xl text-sm font-medium hover:bg-champagne-300 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === 6 ? 'Finish' : 'Next'}
              {!loading && step < 6 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
