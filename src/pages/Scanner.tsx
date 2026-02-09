import { ScanLine, Loader2, Sparkles, DollarSign, MessageSquare, AlertCircle, Store, UtensilsCrossed, Wine } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import RecommendationCard from '../components/RecommendationCard';
import AddWineForm from '../components/AddWineForm';
import WineDetailsModal from '../components/WineDetailsModal';
import { useScannerLogic } from '../hooks/useScannerLogic';
import type { WineRecommendation } from '../types';

export default function Scanner() {
  const { isAdmin } = useAuth();
  const [selectedWineDetails, setSelectedWineDetails] = useState<WineRecommendation | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const {
    state: {
      imageBase64,
      context,
      budgetMin,
      budgetMax,
      notes,
      foodPairing,
      error,
      result,
      selectedWine,
      analyzing
    },
    actions: {
      setImageBase64,
      setContext,
      setBudgetMin,
      setBudgetMax,
      setNotes,
      setFoodPairing,
      handleAnalyze,
      handleNewScan,
      setSelectedWine,
      navigate
    }
  } = useScannerLogic();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
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

      {selectedWineDetails && (
        <WineDetailsModal
          wine={selectedWineDetails}
          onClose={() => setSelectedWineDetails(null)}
        />
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
                    onChange={(e) => setBudgetMin(e.target.value === '' ? '' : Number(e.target.value))}
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
                    onChange={(e) => setBudgetMax(e.target.value === '' ? '' : Number(e.target.value))}
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
                <UtensilsCrossed className="w-4 h-4 text-stone-400" />
                What are you eating?
              </span>
            </label>
            <input
              type="text"
              value={foodPairing}
              onChange={(e) => setFoodPairing(e.target.value)}
              placeholder="e.g., Grilled steak, spicy thai curry, oysters..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
            />
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
              placeholder="e.g., Celebrating an anniversary, want something adventurous, prefer organic..."
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
                {(error.includes('sign in') || error.includes('Unauthorized')) && (
                  <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        navigate('/login');
                    }}
                    className="text-sm text-red-300 font-medium underline mt-1 hover:text-red-100"
                  >
                    Sign Out & Retry
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
                onSelect={() => setSelectedWine(wine)}
                onViewDetails={() => setSelectedWineDetails(wine)}
              />
            ))}
          </div>

          {/* Admin Debug Section */}
          {isAdmin && result.debug && result.debug.allWinesFound && (
            <div className="mt-8 pt-8 border-t border-white/10">
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
                        Deep Researched Candidates ({result.debug.researchedWines.length})
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
                                {result.debug.researchedWines.map((wine, i) => (
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
                        All Identified Wines ({result.debug.allWinesFound.length})
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
                                {result.debug.allWinesFound.map((wine, i) => {
                                    const score = ((wine.profile_match_score * 1.5) + wine.quality_score).toFixed(1);
                                    const isResearched = result.debug?.researchedWines.some(r => r.name === wine.name);
                                    
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
