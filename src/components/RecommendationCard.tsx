import { ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  name: string;
  type: string;
  region?: string | null;
  matchScore: number;
  reason?: string;
  onSelect?: () => void;
  className?: string;
  priceRange?: string; // e.g. "$$" or "$20-30"
}

export default function RecommendationCard({
  name,
  type,
  region,
  matchScore,
  reason = "A perfect match for your palate based on bold fruit notes.",
  onSelect,
  className = "",
  priceRange,
}: RecommendationCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-wine-slate-900/80 backdrop-blur-md border border-champagne-400/20 transition-all duration-500 hover:border-champagne-400/40 hover:shadow-lg hover:shadow-champagne-400/10 ${className}`}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-somm-red-900/0 via-somm-red-900/0 to-somm-red-900/0 group-hover:from-somm-red-900/20 group-hover:to-champagne-400/5 transition-all duration-500 pointer-events-none" />

      <div className="relative p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium tracking-widest text-champagne-400 uppercase">{type}</span>
              {region && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="text-xs text-stone-400 font-sans tracking-wide">{region}</span>
                </>
              )}
            </div>
            <h3 className="font-serif text-2xl text-champagne-100 leading-tight group-hover:text-white transition-colors">
              {name}
            </h3>
            {priceRange && (
               <p className="text-sm text-stone-500 mt-1 font-sans">{priceRange}</p>
            )}
          </div>
          
          {/* Match Score Badge */}
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-full border border-champagne-400/30 bg-wine-slate-950/80 text-champagne-400 shadow-inner shadow-black/50">
            <span className="text-lg font-bold font-serif leading-none mt-1">{matchScore}</span>
            <span className="text-[9px] uppercase tracking-widest opacity-80 mb-0.5">Match</span>
          </div>
        </div>

        {/* Handwritten Note */}
        <div className="mb-8 mt-2 relative pl-4 border-l-2 border-champagne-400/20">
          <p className="font-hand text-xl text-champagne-100/90 leading-relaxed transform -rotate-1 origin-center">
            "{reason}"
          </p>
        </div>

        {/* Footer / Action */}
        <div className="mt-auto flex items-center justify-end">
          <button
            onClick={onSelect}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-somm-red-900 border border-somm-red-500/30 text-champagne-100 text-sm font-medium hover:bg-somm-red-500 hover:text-white hover:border-somm-red-500/50 transition-all duration-300 group-hover:translate-x-1"
          >
            Select
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
