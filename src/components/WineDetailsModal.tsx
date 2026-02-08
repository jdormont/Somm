import { X, Droplet, Wind, Grape, Beaker, Wine as WineIcon } from 'lucide-react';
import type { WineRecommendation } from '../types';

interface WineDetailsModalProps {
  wine: WineRecommendation;
  onClose: () => void;
}

export default function WineDetailsModal({ wine, onClose }: WineDetailsModalProps) {
  
  const getFillClass = (value?: string) => {
    const v = value?.toLowerCase() || '';
    if (v === 'low' || v === 'light') return 'w-1/4 bg-blue-400';
    if (v === 'medium') return 'w-1/2 bg-yellow-400';
    if (v === 'high' || v === 'full') return 'w-full bg-red-500';
    return 'w-0 bg-gray-500';
  };

  const StructureBar = ({ label, value, icon }: { label: string, value?: string, icon: React.ReactNode }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-wider text-stone-400">
        <div className="flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-champagne-400 font-medium">{value || 'Unknown'}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${getFillClass(value)}`} />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-wine-slate-900 border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5 bg-wine-slate-950/50 flex justify-between items-start">
          <div className="pr-8">
             <div className="flex items-center gap-2 mb-1.5">
               <span className="text-xs font-bold tracking-widest text-champagne-400 uppercase bg-champagne-400/10 px-2 py-0.5 rounded-sm">
                 {wine.type}
               </span>
               {wine.region && (
                  <span className="text-xs text-stone-400 font-serif tracking-wide italic">{wine.region}</span>
               )}
            </div>
            
            <h2 className="text-2xl font-serif text-white leading-tight">{wine.name}</h2>
            
            <div className="flex items-center gap-2 mt-1">
                {wine.producer && <span className="text-stone-400 text-sm">{wine.producer}</span>}
                {wine.vintage && <span className="text-stone-500 text-sm.•">{wine.vintage}</span>}
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-white transition-colors rounded-full hover:bg-white/5 -mt-2 -mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-gradient-to-b from-wine-slate-900 to-black/40">
          
          {/* Match Score & Accuracy */}
          <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-champagne-400/30 bg-wine-slate-950 text-champagne-400 shadow-md flex-shrink-0">
               <span className="text-2xl font-bold font-serif leading-none mt-1">{wine.match_score}</span>
               <span className="text-[9px] uppercase tracking-widest opacity-60">Match</span>
            </div>
            <div>
               <h4 className="text-sm font-semibold text-champagne-100 mb-1.5 uppercase tracking-wide">Why it fits you</h4>
               <p className="text-sm text-stone-300 leading-relaxed italic">"{wine.reasoning}"</p>
            </div>
          </div>

          {/* Structure Grid */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Structure Profile</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
               <StructureBar label="Body" value={wine.structure?.body} icon={<WineIcon className="w-3 h-3" />} />
               <StructureBar label="Tannins" value={wine.structure?.tannins} icon={<Grape className="w-3 h-3" />} />
               <StructureBar label="Acidity" value={wine.structure?.acidity} icon={<Droplet className="w-3 h-3" />} />
               <StructureBar label="Alcohol" value={wine.structure?.alcohol} icon={<Beaker className="w-3 h-3" />} />
            </div>
          </div>

          {/* Tasting Notes */}
          <div>
             <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-widest border-b border-white/10 pb-2">Tasting Notes</h3>
             <p className="text-sm text-stone-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                {wine.tasting_notes}
             </p>
          </div>

          {/* Food Pairings */}
          <div>
             <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-widest border-b border-white/10 pb-2">Food Pairings</h3>
             <div className="flex flex-wrap gap-2">
                {wine.food_pairings?.map((pairing, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg bg-somm-red-900/10 border border-somm-red-500/20 text-somm-red-200 text-xs font-medium hover:bg-somm-red-900/20 transition-colors cursor-default">
                        {pairing}
                    </span>
                ))}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
