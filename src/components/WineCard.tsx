import { useState } from 'react';
import { Wine, MapPin, DollarSign, Utensils, TrendingUp, BookOpen, Star, Check, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
}

const typeColors: Record<string, { bg: string; text: string; dot: string }> = {
  red: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  white: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  rosé: { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-400' },
  sparkling: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400' },
  dessert: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  fortified: { bg: 'bg-stone-100', text: 'text-stone-700', dot: 'bg-stone-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
};

function getScoreColor(score: number) {
  if (score >= 85) return 'text-emerald-600 bg-emerald-50';
  if (score >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-stone-600 bg-stone-100';
}

export default function WineCard({ wine, index }: { wine: WineRecommendation; index: number }) {
  const { user } = useAuth();
  const typeLower = wine.type?.toLowerCase() || 'red';
  const colors = typeColors[typeLower] || typeColors.red;
  const scoreColor = getScoreColor(wine.match_score);

  const [showSave, setShowSave] = useState(false);
  const [saveRating, setSaveRating] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSaveToCellar = async () => {
    if (!user || saveRating === 0) return;
    await supabase.from('wine_memories').insert({
      user_id: user.id,
      name: wine.name,
      producer: wine.producer || '',
      vintage: wine.vintage || '',
      type: wine.type || '',
      region: wine.region || '',
      rating: saveRating,
      price: wine.price,
      notes: '',
    });
    setSaved(true);
    setTimeout(() => setShowSave(false), 1500);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all duration-300 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                {wine.type}
              </span>
              {wine.vintage && (
                <span className="text-xs text-stone-400">{wine.vintage}</span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-stone-900 leading-tight group-hover:text-wine-800 transition-colors">
              {wine.name}
            </h3>
            {wine.producer && (
              <p className="text-sm text-stone-500 mt-0.5">{wine.producer}</p>
            )}
          </div>
          <div className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl ${scoreColor}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-lg font-bold leading-none">{wine.match_score}</span>
            <span className="text-[10px] uppercase tracking-wider font-medium opacity-70">match</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-stone-500">
          {wine.region && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {wine.region}
            </span>
          )}
          {wine.price != null && (
            <span className="inline-flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              ${wine.price}
            </span>
          )}
        </div>

        <p className="text-sm text-stone-600 leading-relaxed mb-4">{wine.reasoning}</p>

        {wine.critic_info && (
          <div className="flex items-start gap-2.5 bg-amber-50/70 rounded-xl p-3.5 mb-4 border border-amber-100/80">
            <Award className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">{wine.critic_info}</p>
          </div>
        )}

        <div className="bg-stone-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wine className="w-3.5 h-3.5 text-wine-700" />
            <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Tasting Notes</span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{wine.tasting_notes}</p>
        </div>

        {wine.food_pairings && wine.food_pairings.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Utensils className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Pairs with</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {wine.food_pairings.map((pairing) => (
                <span
                  key={pairing}
                  className="px-2.5 py-1 bg-cream-100 text-stone-600 rounded-lg text-xs font-medium"
                >
                  {pairing}
                </span>
              ))}
            </div>
          </div>
        )}

        {!showSave && !saved ? (
          <button
            onClick={() => setShowSave(true)}
            className="flex items-center gap-2 text-sm font-medium text-wine-800 hover:text-wine-900 transition-colors px-3 py-2 -mx-3 rounded-xl hover:bg-wine-50"
          >
            <BookOpen className="w-4 h-4" />
            I chose this wine - save to Cellar
          </button>
        ) : saved ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 px-3 py-2">
            <Check className="w-4 h-4" />
            Saved to your Cellar
          </div>
        ) : (
          <div className="bg-wine-50/50 rounded-xl p-4 border border-wine-100">
            <p className="text-xs font-medium text-stone-700 mb-2">How would you rate this wine?</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSaveRating(star)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= saveRating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToCellar}
                disabled={saveRating === 0}
                className="flex-1 bg-wine-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-wine-900 transition-colors disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={() => { setShowSave(false); setSaveRating(0); }}
                className="px-3 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
