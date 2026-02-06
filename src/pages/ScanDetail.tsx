import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Store, UtensilsCrossed, DollarSign, Wine, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import WineCard, { type WineRecommendation } from '../components/WineCard';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-wine-800 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Wine className="w-8 h-8 text-stone-300" />
          </div>
          <p className="text-stone-500 text-sm mb-4">Scan not found</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-wine-800 hover:text-wine-900"
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
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-stone-900 truncate">
            {session.recommendations?.[0]?.name || 'Wine Scan'}
          </h1>
          <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(session.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          isRestaurant
            ? 'bg-amber-50 text-amber-700'
            : 'bg-sky-50 text-sky-700'
        }`}>
          {isRestaurant
            ? <UtensilsCrossed className="w-3 h-3" />
            : <Store className="w-3 h-3" />
          }
          {isRestaurant ? 'Restaurant' : 'Store'}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
          <DollarSign className="w-3 h-3" />
          ${session.budget_min} - ${session.budget_max}
        </span>
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
          <Wine className="w-3 h-3" />
          {session.wines_detected?.length || 0} detected
        </span>
      </div>

      {session.notes && (
        <div className="flex items-start gap-2.5 bg-stone-50 rounded-xl p-4 mb-6 border border-stone-100">
          <MessageSquare className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-stone-600 leading-relaxed">{session.notes}</p>
        </div>
      )}

      {session.summary && (
        <div className="bg-wine-50 border border-wine-100 rounded-2xl p-5 mb-6">
          <p className="text-sm text-wine-800 leading-relaxed">{session.summary}</p>
        </div>
      )}

      {session.recommendations && session.recommendations.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">
            Recommendations ({session.recommendations.length})
          </h2>
          <div className="space-y-4">
            {session.recommendations.map((wine, i) => (
              <WineCard key={`${wine.name}-${i}`} wine={wine} index={i} />
            ))}
          </div>
        </div>
      )}

      {session.wines_detected && session.wines_detected.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">
            All Wines Detected ({session.wines_detected.length})
          </h2>
          <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100">
            {session.wines_detected.map((wine, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs font-mono text-stone-300 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 truncate">{wine.name}</p>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                    {wine.type && <span>{wine.type}</span>}
                    {wine.region && <span>{wine.region}</span>}
                    {wine.price != null && <span>${wine.price}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-stone-100">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'Deleting...' : 'Delete this scan'}
        </button>
      </div>
    </div>
  );
}
