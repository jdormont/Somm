import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Clock, Wine, MapPin, DollarSign, Loader2, Trash2, ArrowRight, Heart, Settings, Plus, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ScanSession {
  id: string;
  budget_min: number;
  budget_max: number;
  notes: string;
  wines_detected: Array<{ name: string; type: string }>;
  recommendations: Array<{
    name: string;
    match_score: number;
    type: string;
    region: string | null;
    price: number | null;
  }>;
  summary: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPrefs, setHasPrefs] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingWineKey, setSavingWineKey] = useState<string | null>(null);
  const [saveRating, setSaveRating] = useState(0);
  const [savedWines, setSavedWines] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [sessionsRes, prefsRes] = await Promise.all([
      supabase
        .from('scan_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

    setSessions(sessionsRes.data || []);
    setHasPrefs(!!prefsRes.data);
    setHasApiKey(!!localStorage.getItem('somm_openai_api_key'));
    setLoading(false);
  };

  const deleteSession = async (id: string) => {
    await supabase.from('scan_sessions').delete().eq('id', id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveToCellar = async (rec: ScanSession['recommendations'][0], wineKey: string) => {
    if (!user || saveRating === 0) return;
    await supabase.from('wine_memories').insert({
      user_id: user.id,
      name: rec.name,
      type: rec.type || '',
      region: rec.region || '',
      price: rec.price,
      rating: saveRating,
      producer: '',
      vintage: '',
      notes: '',
    });
    setSavedWines((prev) => new Set(prev).add(wineKey));
    setSavingWineKey(null);
    setSaveRating(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-wine-800 animate-spin" />
      </div>
    );
  }

  const showSetup = !hasPrefs || !hasApiKey;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500">Your wine scanning headquarters</p>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 bg-wine-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-wine-900 transition-all hover:shadow-md hover:shadow-wine-800/10"
        >
          <ScanLine className="w-4 h-4" />
          New scan
        </Link>
      </div>

      {showSetup && (
        <div className="mb-8 space-y-3">
          {!hasApiKey && (
            <Link
              to="/settings"
              className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100/80 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Add your OpenAI API key</p>
                <p className="text-xs text-amber-700">Required to scan and analyze wine lists</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {!hasPrefs && (
            <Link
              to="/preferences"
              className="flex items-center gap-4 p-4 bg-wine-50 border border-wine-100 rounded-2xl hover:bg-wine-100/60 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-wine-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-wine-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-wine-900">Set your wine preferences</p>
                <p className="text-xs text-wine-700">Help us make better recommendations for you</p>
              </div>
              <ArrowRight className="w-4 h-4 text-wine-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-stone-900 uppercase tracking-wider mb-4">Recent Scans</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Wine className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500 text-sm mb-1">No scans yet</p>
            <p className="text-stone-400 text-xs">Scan a wine list to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isExpanded = expandedId === session.id;
              const topRec = session.recommendations?.[0];
              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : session.id)}
                    className="w-full text-left p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center flex-shrink-0">
                      <Wine className="w-5 h-5 text-wine-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {topRec ? topRec.name : 'Wine scan'}
                        </p>
                        {topRec && (
                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            {topRec.match_score}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(session.created_at)}
                        </span>
                        <span>{session.wines_detected?.length || 0} wines found</span>
                        {session.notes && (
                          <span className="truncate max-w-32">{session.notes}</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-stone-100 pt-3">
                      {session.summary && (
                        <p className="text-sm text-stone-600 mb-3">{session.summary}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-stone-500 mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${session.budget_min} - ${session.budget_max}
                        </span>
                      </div>

                      {session.recommendations && session.recommendations.length > 0 && (
                        <div className="space-y-2">
                          {session.recommendations.map((rec, i) => {
                            const wineKey = `${session.id}-${i}`;
                            const isSaving = savingWineKey === wineKey;
                            const isSaved = savedWines.has(wineKey);
                            return (
                              <div key={i} className="bg-stone-50 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 p-3">
                                  <span className="text-xs font-bold text-stone-400 w-5">#{i + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-stone-800 truncate">{rec.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                                      <span>{rec.type}</span>
                                      {rec.region && (
                                        <span className="flex items-center gap-0.5">
                                          <MapPin className="w-3 h-3" />
                                          {rec.region}
                                        </span>
                                      )}
                                      {rec.price != null && <span>${rec.price}</span>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs font-bold text-emerald-600">{rec.match_score}%</span>
                                    {isSaved ? (
                                      <span className="text-emerald-600">
                                        <Check className="w-4 h-4" />
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSavingWineKey(isSaving ? null : wineKey);
                                          setSaveRating(0);
                                        }}
                                        className="text-stone-400 hover:text-wine-800 transition-colors"
                                        title="Add to cellar"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {isSaving && (
                                  <div className="px-3 pb-3 pt-1 border-t border-stone-100">
                                    <p className="text-xs text-stone-600 mb-2">Rate this wine to save it to your cellar:</p>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSaveRating(star);
                                            }}
                                            className="hover:scale-110 transition-transform"
                                          >
                                            <Star
                                              className={`w-5 h-5 transition-colors ${
                                                star <= saveRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSaveToCellar(rec, wineKey);
                                        }}
                                        disabled={saveRating === 0}
                                        className="bg-wine-800 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-wine-900 transition-colors disabled:opacity-40"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSavingWineKey(null);
                                          setSaveRating(0);
                                        }}
                                        className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="mt-3 flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete scan
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
