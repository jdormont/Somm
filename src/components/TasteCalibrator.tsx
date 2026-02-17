
import { useState, useRef } from 'react';
import { Search, Camera, X, Loader2, Sparkles, Wine } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TasteAnchor } from '../hooks/useTasteCalibration';
import { tasteService } from '../services/tasteService';

interface TasteCalibratorProps {
  anchors: TasteAnchor[];
  onAnchorsChange: (anchors: TasteAnchor[]) => void;
  onApplyCalibration: () => void;
}

export default function TasteCalibrator({ anchors, onAnchorsChange, onApplyCalibration }: TasteCalibratorProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    analyzeWine({ query: query.trim() });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Remove data:image/...;base64, prefix if present, but the function handles it too.
      analyzeWine({ image_base64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const analyzeWine = async (payload: { query?: string; image_base64?: string }) => {
    setAnalyzing(true);
    setError(null);
    setQuery('');
    
    try {
        const data = await tasteService.analyzeAnchorWine(payload);
        
        // Save to DB
        if (!user) return;
        
        const newAnchor = {
            user_id: user.id,
            wine_name: data.wine_name,
            producer: data.producer,
            vintage: data.vintage,
            profile_data: data.profile,
            data_source: data.data_source,
            source_url: data.source_url
        };

        const { data: savedAnchor, error: dbError } = await supabase
            .from('user_taste_anchors')
            .insert(newAnchor)
            .select()
            .single();

        if (dbError) throw dbError;

        onAnchorsChange([...anchors, savedAnchor]);
        setShowInput(false);

    } catch (err: any) {
        setError(err.message);
    } finally {
        setAnalyzing(false);
    }
  };

  const removeAnchor = async (id: string) => {
      // Optimistic update
      onAnchorsChange(anchors.filter(a => a.id !== id));
      await supabase.from('user_taste_anchors').delete().eq('id', id);
  };

  return (
    <div className="bg-wine-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden group">
       {/* Background decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-somm-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

       <div className="relative z-10">
           <div className="flex items-start justify-between mb-4">
                <div>
                   <h2 className="text-lg font-serif text-champagne-100 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-champagne-400" />
                       Calibrate with your Favorites
                   </h2>
                   <p className="text-sm text-stone-400 mt-1 max-w-md">
                       Add up to 3 wines you love. We'll analyze their technical profiles and tune your taste sliders automatically.
                   </p>
                </div>
                {anchors.length > 0 && (
                    <button
                        onClick={onApplyCalibration}
                        className="text-xs font-medium text-somm-red-300 hover:text-somm-red-200 underline decoration-somm-red-300/30 underline-offset-4"
                    >
                        Recalibrate
                    </button>
                )}
           </div>

           {/* Anchor List */}
           <div className="flex flex-wrap gap-3 mb-4">
                {anchors.map((anchor) => (
                    <div key={anchor.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl pl-3 pr-2 py-2 animate-in fade-in zoom-in duration-200">
                        <div className="w-8 h-8 rounded-full bg-somm-red-900/40 flex items-center justify-center text-somm-red-300">
                            <Wine className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-champagne-100 leading-tight">{anchor.wine_name}</p>
                            <p className="text-xs text-stone-500">{anchor.producer} {anchor.vintage}</p>
                        </div>
                         {anchor.profile_data && (
                             <div className="ml-2 px-1.5 py-0.5 bg-emerald-500/10 rounded text-[10px] text-emerald-400 font-mono">
                                 Verified
                             </div>
                         )}
                        <button 
                            onClick={() => removeAnchor(anchor.id)}
                            className="ml-1 p-1.5 hover:bg-white/10 rounded-lg text-stone-500 hover:text-stone-300 transition-colors"
                            aria-label="Remove anchor"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
                
                {anchors.length < 3 && !showInput && !analyzing && (
                    <button
                        onClick={() => setShowInput(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-stone-400 hover:text-champagne-100 hover:border-champagne-400/30 hover:bg-white/5 transition-all text-sm"
                    >
                        <Search className="w-4 h-4" />
                        Add Wine
                    </button>
                )}
           </div>
           
           {/* Input Area */}
           {(showInput || analyzing) && (
               <div className="animate-in slide-in-from-top-2 duration-200">
                   <div className="flex gap-2">
                       <div className="relative flex-1">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                           <input
                               type="text"
                               value={query}
                               onChange={(e) => setQuery(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                               placeholder="e.g. Austin Hope Cabernet 2020"
                               className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:border-champagne-400/50 focus:ring-1 focus:ring-champagne-400/20"
                               autoFocus
                               disabled={analyzing}
                               aria-label="Search for a wine"
                           />
                       </div>
                       
                       <button
                           onClick={() => fileInputRef.current?.click()}
                           disabled={analyzing}
                           className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-stone-400 hover:text-champagne-100 hover:bg-white/10 transition-colors"
                           title="Scan Bottle"
                           aria-label="Scan Bottle"
                       >
                           <Camera className="w-5 h-5" />
                       </button>
                       <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            aria-label="Upload wine image"
                        />
                       
                       <button
                           onClick={handleSearch}
                           disabled={analyzing || !query.trim()}
                           className="px-4 py-2.5 rounded-xl bg-champagne-400 text-somm-red-950 font-medium text-sm hover:bg-champagne-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                       >
                           {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                       </button>

                       {!analyzing && (
                           <button 
                                onClick={() => { setShowInput(false); setError(null); }}
                                className="p-2.5 text-stone-500 hover:text-stone-300"
                                aria-label="Cancel search"
                           >
                               <X className="w-5 h-5" />
                           </button>
                       )}
                   </div>
                   {error && (
                       <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                           <X className="w-3 h-3" /> {error}
                       </p>
                   )}
                   {analyzing && (
                       <p className="mt-2 text-xs text-stone-500 animate-pulse">
                           Searching technical sheets and reviews...
                       </p>
                   )}
               </div>
           )}
       </div>
    </div>
  );
}
