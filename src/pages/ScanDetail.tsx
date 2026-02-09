import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Store, UtensilsCrossed, DollarSign, Wine, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RecommendationCard from '../components/RecommendationCard';
import AddWineForm from '../components/AddWineForm';
import WineDetailsModal from '../components/WineDetailsModal';
import { useScan, useDeleteScan } from '../hooks/useScans';
import { WineInput, WineRecommendation } from '../types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedWine, setSelectedWine] = useState<WineInput | null>(null);
  const [selectedWineDetails, setSelectedWineDetails] = useState<WineRecommendation | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const { data: session, isLoading, error } = useScan(id, user?.id);
  const deleteScan = useDeleteScan();

  const handleDelete = async () => {
    if (!session) return;
    try {
      await deleteScan.mutateAsync(session.id);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const handleSelectWine = (wine: WineInput) => {
    setSelectedWine(wine);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-somm-red-500 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Wine className="w-8 h-8 text-stone-500" />
          </div>
          <p className="text-stone-400 text-sm mb-4">Scan not found</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-champagne-400 hover:text-champagne-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isRestaurant = session.context === 'restaurant';

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {selectedWineDetails && (
        <WineDetailsModal
          wine={selectedWineDetails}
          onClose={() => setSelectedWineDetails(null)}
        />
      )}

      {selectedWine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <AddWineForm
              initialData={{
                name: selectedWine.name,
                producer: selectedWine.producer || undefined,
                vintage: selectedWine.vintage || undefined,
                type: selectedWine.type || 'Red',
                region: selectedWine.region || undefined,
                price: selectedWine.price || undefined,
                notes: selectedWine.notes || undefined,
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
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-champagne-400/20 text-stone-400 hover:text-champagne-100 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-serif text-champagne-100 truncate">
            {session.recommendations?.[0]?.name || 'Wine Scan'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-400 mt-1 font-light">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(session.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          isRestaurant
            ? 'bg-amber-900/20 text-amber-200 border-amber-500/20'
            : 'bg-sky-900/20 text-sky-200 border-sky-500/20'
        }`}>
          {isRestaurant
            ? <UtensilsCrossed className="w-3 h-3" />
            : <Store className="w-3 h-3" />
          }
          {isRestaurant ? 'Restaurant' : 'Store'}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-stone-300">
          <DollarSign className="w-3 h-3 text-stone-500" />
          ${session.budget_min} - ${session.budget_max}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-stone-300">
          <Wine className="w-3 h-3 text-stone-500" />
          {session.wines_detected?.length || 0} detected
        </span>
      </div>

      {session.notes && (
        <div className="flex items-start gap-3 bg-wine-slate-900/50 backdrop-blur-sm rounded-2xl p-5 mb-8 border border-white/5">
          <MessageSquare className="w-5 h-5 text-champagne-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-champagne-100/90 leading-relaxed font-light font-serif tracking-wide">"{session.notes}"</p>
        </div>
      )}

      {session.summary && (
        <div className="bg-somm-red-900/10 border border-somm-red-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Wine className="w-24 h-24 text-somm-red-500" />
          </div>
          <p className="text-sm text-champagne-100 leading-relaxed relative z-10">{session.summary}</p>
        </div>
      )}

      {session.recommendations && session.recommendations.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1 mb-5">
            Top Recommendations ({session.recommendations.length})
          </h2>
          <div className="space-y-6">
            {session.recommendations.map((wine, i) => (
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
                onViewDetails={() => setSelectedWineDetails(wine)}
              />
            ))}
          </div>
        </div>
      )}

      {session.wines_detected && session.wines_detected.length > 0 && (
        <div className="mt-12">
           <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1 mb-5">
            All Wines Detected ({session.wines_detected.length})
          </h2>
          <div className="bg-wine-slate-900/30 rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden backdrop-blur-sm">
            {session.wines_detected.map((wine, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <span className="text-xs font-mono text-stone-600 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-200 truncate">{wine.name}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 font-light">
                    {wine.type && <span className="capitalize">{wine.type}</span>}
                    {wine.region && (
                        <>
                            <span className="w-0.5 h-0.5 rounded-full bg-stone-600"></span>
                            <span>{wine.region}</span>
                        </>
                    )}
                    {wine.price != null && (
                         <>
                            <span className="w-0.5 h-0.5 rounded-full bg-stone-600"></span>
                            <span>${wine.price}</span>
                        </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Debug Section */}
      {isAdmin && session.debug_info && session.debug_info.allWinesFound && (
        <div className="mt-12 pt-8 border-t border-white/5">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 text-xs font-mono text-stone-500 hover:text-stone-300 transition-colors mb-4"
          >
            <div className={`w-2 h-2 rounded-full ${showDebug ? 'bg-somm-red-500' : 'bg-stone-600'}`} />
            {showDebug ? 'Hide' : 'Show'} Admin Debug Info
          </button>
          
          {showDebug && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Researched Wines Table */}
               <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-xs font-medium text-champagne-100 uppercase tracking-wider">
                    Deep Researched Candidates ({session.debug_info.researchedWines.length})
                  </h3>
                  <span className="text-[10px] text-stone-500 font-mono">Top 8 selected</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-400">
                        <thead className="bg-white/5 text-stone-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2 text-right">Profile</th>
                                <th className="px-4 py-2 text-right">Quality</th>
                                <th className="px-4 py-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {session.debug_info.researchedWines.map((wine, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-2 font-medium text-stone-300">{wine.name}</td>
                                    <td className="px-4 py-2 text-right">{wine.profile_match_score}</td>
                                    <td className="px-4 py-2 text-right">{wine.quality_score}</td>
                                    <td className="px-4 py-2 text-right text-champagne-400 font-bold">
                                        {((wine.profile_match_score * 1.5) + wine.quality_score).toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>

              {/* All Wines Table */}
              <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                  <h3 className="text-xs font-medium text-champagne-100 uppercase tracking-wider">
                    All Identified Wines ({session.debug_info.allWinesFound.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-stone-400">
                        <thead className="bg-white/5 text-stone-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2 text-right">Profile</th>
                                <th className="px-4 py-2 text-right">Quality</th>
                                <th className="px-4 py-2 text-right">Total</th>
                                <th className="px-4 py-2">Review Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {session.debug_info.allWinesFound.map((wine, i) => {
                                const score = ((wine.profile_match_score * 1.5) + wine.quality_score).toFixed(1);
                                const isResearched = session.debug_info?.researchedWines.some(r => r.name === wine.name);
                                
                                return (
                                    <tr key={i} className={`hover:bg-white/5 transition-colors ${isResearched ? 'bg-somm-red-900/10' : ''}`}>
                                        <td className="px-4 py-2 text-stone-300">{wine.name}</td>
                                        <td className="px-4 py-2 text-right">{wine.profile_match_score}</td>
                                        <td className="px-4 py-2 text-right">{wine.quality_score}</td>
                                        <td className="px-4 py-2 text-right font-medium">{score}</td>
                                         <td className="px-4 py-2">
                                            {isResearched ? (
                                                <span className="text-somm-red-400 font-medium text-[10px] uppercase">Researched</span>
                                            ) : (
                                                <span className="text-stone-600 text-[10px] uppercase">Skipped</span>
                                            )}
                                         </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
        <button
          onClick={handleDelete}
          disabled={deleteScan.isPending}
          className="group flex items-center gap-2 text-sm text-stone-600 hover:text-red-400 transition-colors px-4 py-2 rounded-full hover:bg-red-900/10"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {deleteScan.isPending ? 'Deleting...' : 'Delete this scan'}
        </button>
      </div>
    </div>
  );
}
