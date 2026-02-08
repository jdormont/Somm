import { ScanLine, Loader2, Sparkles, DollarSign, MessageSquare, AlertCircle, Store, UtensilsCrossed, Wine } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import RecommendationCard from '../components/RecommendationCard';
import AddWineForm from '../components/AddWineForm';
import { useScannerLogic } from '../hooks/useScannerLogic';

export default function Scanner() {
  const {
    state: {
      imageBase64,
      context,
      budgetMin,
      budgetMax,
      notes,
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
                producer: selectedWine.producer,
                vintage: selectedWine.vintage,
                type: selectedWine.type || 'Red',
                region: selectedWine.region,
                price: selectedWine.price,
                notes: selectedWine.tasting_notes,
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
                <MessageSquare className="w-4 h-4 text-stone-400" />
                Additional Notes
              </span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Pairing with grilled salmon, celebrating an anniversary, want something adventurous..."
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
              />
            ))}
          </div>

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
