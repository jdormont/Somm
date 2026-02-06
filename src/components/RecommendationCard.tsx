import { TrendingUp, MapPin, DollarSign, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface RecommendationCardProps {
  wine: {
    id: string;
    name: string;
    producer?: string;
    region?: string;
    vintage?: number;
    price?: number;
    match_score: number;
    type: string;
    reasoning?: string;
  };
  index?: number;
  onSelect?: (wineId: string) => void;
}

export function RecommendationCard({ wine, index = 0, onSelect }: RecommendationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(wine.id);
    }
  };

  const getMatchLevel = (score: number) => {
    if (score >= 90) return { label: 'Exceptional Match', color: 'text-champagne-400' };
    if (score >= 80) return { label: 'Great Match', color: 'text-champagne-400' };
    if (score >= 70) return { label: 'Good Match', color: 'text-champagne-400' };
    return { label: 'Worth Trying', color: 'text-champagne-400' };
  };

  const matchLevel = getMatchLevel(wine.match_score);

  return (
    <div
      className="group relative animate-fade-in-up"
      style={{
        animationDelay: `${index * 150}ms`,
        animationFillMode: 'both'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative bg-wine-slate-900/80 backdrop-blur-md rounded-2xl
          border border-white/10 overflow-hidden
          transition-all duration-500 ease-out
          ${isHovered ? 'border-champagne-400/30 shadow-2xl shadow-champagne-400/5' : ''}
        `}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-champagne-400/10 border border-champagne-400/20 mb-4">
                <TrendingUp className="w-3.5 h-3.5 text-champagne-400" />
                <span className="text-xs font-sans font-medium text-champagne-400 uppercase tracking-wider">
                  {wine.match_score}% Match
                </span>
              </div>

              <h3
                className={`
                  font-serif font-light text-3xl sm:text-4xl text-champagne-100 leading-tight mb-2
                  transition-colors duration-500
                  ${isHovered ? 'text-champagne-400' : ''}
                `}
              >
                {wine.name}
              </h3>

              {wine.producer && (
                <p className="font-sans text-sm text-champagne-100/60 tracking-wide mb-3">
                  {wine.producer}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-champagne-100/50 font-sans">
                {wine.region && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {wine.region}
                  </span>
                )}
                {wine.vintage && (
                  <span className="inline-flex items-center gap-1.5">
                    {wine.vintage}
                  </span>
                )}
                {wine.price != null && (
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {wine.price}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-champagne-400/20 to-champagne-400/5 border border-champagne-400/30 flex items-center justify-center">
                <span className="text-2xl font-serif font-light text-champagne-400">
                  {wine.match_score}
                </span>
              </div>
            </div>
          </div>

          {wine.reasoning && (
            <div className="relative mb-6">
              <div className="absolute -left-2 top-0">
                <Sparkles className="w-4 h-4 text-champagne-400/30" />
              </div>
              <div className="pl-6">
                <p className="text-xs font-sans uppercase tracking-widest text-champagne-400/60 mb-2">
                  Why you'll love it
                </p>
                <p
                  className="font-serif text-base leading-relaxed text-champagne-100/80 italic"
                  style={{
                    fontStyle: 'italic',
                    letterSpacing: '0.01em'
                  }}
                >
                  {wine.reasoning}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <button
              onClick={handleSelect}
              className={`
                flex-1 relative overflow-hidden
                px-6 py-3 rounded-xl
                font-sans text-sm font-medium tracking-wide
                bg-somm-red-900 text-champagne-100
                border border-somm-red-500/30
                transition-all duration-500 ease-out
                ${isHovered
                  ? 'bg-somm-red-500 border-champagne-400/50 shadow-lg shadow-somm-red-500/20'
                  : 'hover:bg-somm-red-500 hover:border-champagne-400/50'
                }
              `}
            >
              <span className="relative z-10">Select This Wine</span>
              <div
                className={`
                  absolute inset-0 bg-gradient-to-r from-champagne-400/0 via-champagne-400/10 to-champagne-400/0
                  transition-transform duration-500
                  ${isHovered ? 'translate-x-full' : '-translate-x-full'}
                `}
              />
            </button>

            <div className="text-right">
              <p className="text-xs font-sans uppercase tracking-wider text-champagne-400/60">
                {matchLevel.label}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`
            absolute inset-0 pointer-events-none
            bg-gradient-to-br from-champagne-400/0 via-champagne-400/0 to-champagne-400/5
            opacity-0 transition-opacity duration-500
            ${isHovered ? 'opacity-100' : ''}
          `}
        />
      </div>
    </div>
  );
}
