import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Store, UtensilsCrossed, DollarSign, Wine, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import RecommendationCard from '../components/RecommendationCard';
import AddWineForm from '../components/AddWineForm';

interface WineRecommendation {
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

interface ScanSession {
  id: string;
  budget_min: number;
  budget_max: number;
  context: string;
  notes: string;
  wines_detected: Array<{
    name: string;
    producer: string | null;
    vintage: string | null;
    type: string;
    region: string | null;
    price: number | null;
  }>;
  recommendations: WineRecommendation[];
  summary: string;
  created_at: string;
}

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<ScanSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedWine, setSelectedWine] = useState<any | null>(null);

  useEffect(() => {
    if (user && id) loadSession();
  }, [user, id]);

  const loadSession = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('scan_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    setSession(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!session) return;
    setDeleting(true);
    await supabase.from('scan_sessions').delete().eq('id', session.id);
    navigate('/dashboard', { replace: true });
  };

  const handleSelectWine = (wine: any) => {
    setSelectedWine(wine);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-somm-red-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
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

      <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="group flex items-center gap-2 text-sm text-stone-600 hover:text-red-400 transition-colors px-4 py-2 rounded-full hover:bg-red-900/10"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {deleting ? 'Deleting...' : 'Delete this scan'}
        </button>
      </div>
    </div>
  );
}
