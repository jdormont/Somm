import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScanLine, Clock, Wine, DollarSign, Loader2, ArrowRight, Heart, Settings, Search, X, Store, UtensilsCrossed, TrendingUp, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ScanSession {
  id: string;
  budget_min: number;
  budget_max: number;
  context: string;
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

type DateFilter = 'all' | 'week' | 'month' | '3months';
type ContextFilter = 'all' | 'store' | 'restaurant';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDateCutoff(filter: DateFilter): Date | null {
  if (filter === 'all') return null;
  const now = new Date();
  if (filter === 'week') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (filter === 'month') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
}

function matchesSearch(session: ScanSession, query: string): boolean {
  const q = query.toLowerCase();
  if (session.notes?.toLowerCase().includes(q)) return true;
  if (session.summary?.toLowerCase().includes(q)) return true;
  if (session.recommendations?.some((r) =>
    r.name.toLowerCase().includes(q) ||
    r.region?.toLowerCase().includes(q) ||
    r.type?.toLowerCase().includes(q)
  )) return true;
  if (session.wines_detected?.some((w) =>
    w.name.toLowerCase().includes(q) ||
    w.type?.toLowerCase().includes(q)
  )) return true;
  return false;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPrefs, setHasPrefs] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [contextFilter, setContextFilter] = useState<ContextFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [sessionsRes, prefsRes] = await Promise.all([
      supabase
        .from('scan_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
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

  const filtered = useMemo(() => {
    let result = sessions;

    if (contextFilter !== 'all') {
      result = result.filter((s) => (s.context || 'store') === contextFilter);
    }

    const cutoff = getDateCutoff(dateFilter);
    if (cutoff) {
      result = result.filter((s) => new Date(s.created_at) >= cutoff);
    }

    if (searchQuery.trim()) {
      result = result.filter((s) => matchesSearch(s, searchQuery.trim()));
    }

    return result;
  }, [sessions, contextFilter, dateFilter, searchQuery]);

  const totalWinesDiscovered = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (s.wines_detected?.length || 0), 0);
  }, [sessions]);

  const avgMatch = useMemo(() => {
    const allScores = sessions.flatMap((s) => s.recommendations?.map((r) => r.match_score) || []);
    if (allScores.length === 0) return 0;
    return Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  }, [sessions]);

  const hasActiveFilters = contextFilter !== 'all' || dateFilter !== 'all' || searchQuery.trim() !== '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-champagne-400 animate-spin" />
      </div>
    );
  }

  const showSetup = !hasPrefs || !hasApiKey;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-light text-champagne-100">Dashboard</h1>
          <p className="text-sm font-sans tracking-wide text-champagne-100/60">Your wine scanning headquarters</p>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 bg-somm-red-900 text-champagne-100 border border-somm-red-500/30 px-5 py-2.5 rounded-xl text-sm font-sans font-medium hover:bg-somm-red-500 hover:border-champagne-400/50 hover:shadow-lg hover:shadow-somm-red-500/20 transition-all duration-500"
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
              className="flex items-center gap-4 p-4 bg-wine-slate-900/80 backdrop-blur-md border border-champagne-400/30 rounded-2xl hover:border-champagne-400/50 hover:shadow-lg hover:shadow-champagne-400/10 transition-all duration-500 group"
            >
              <div className="w-10 h-10 rounded-xl bg-champagne-400/10 border border-champagne-400/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-champagne-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-medium text-champagne-100">Add your OpenAI API key</p>
                <p className="text-xs font-sans tracking-wide text-champagne-100/60">Required to scan and analyze wine lists</p>
              </div>
              <ArrowRight className="w-4 h-4 text-champagne-400 group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
          )}
          {!hasPrefs && (
            <Link
              to="/preferences"
              className="flex items-center gap-4 p-4 bg-wine-slate-900/80 backdrop-blur-md border border-champagne-400/30 rounded-2xl hover:border-champagne-400/50 hover:shadow-lg hover:shadow-champagne-400/10 transition-all duration-500 group"
            >
              <div className="w-10 h-10 rounded-xl bg-champagne-400/10 border border-champagne-400/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-champagne-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-sans font-medium text-champagne-100">Set your wine preferences</p>
                <p className="text-xs font-sans tracking-wide text-champagne-100/60">Help us make better recommendations for you</p>
              </div>
              <ArrowRight className="w-4 h-4 text-champagne-400 group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
          )}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-wine-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center hover:border-champagne-400/30 transition-all duration-500">
            <p className="text-2xl font-serif font-light text-champagne-100">{sessions.length}</p>
            <p className="text-xs font-sans tracking-wider text-champagne-100/60 mt-0.5 uppercase">Scans</p>
          </div>
          <div className="bg-wine-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center hover:border-champagne-400/30 transition-all duration-500">
            <p className="text-2xl font-serif font-light text-champagne-100">{totalWinesDiscovered}</p>
            <p className="text-xs font-sans tracking-wider text-champagne-100/60 mt-0.5 uppercase">Wines Found</p>
          </div>
          <div className="bg-wine-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center hover:border-champagne-400/30 transition-all duration-500">
            <div className="flex items-center justify-center gap-1">
              <p className="text-2xl font-serif font-light text-champagne-400">{avgMatch}%</p>
            </div>
            <p className="text-xs font-sans tracking-wider text-champagne-100/60 mt-0.5 uppercase">Avg Match</p>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-sans font-semibold text-champagne-100 uppercase tracking-wider">Scan History</h2>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setContextFilter('all');
                setDateFilter('all');
              }}
              className="text-xs font-sans text-champagne-400 hover:text-champagne-100 font-medium transition-colors duration-500"
            >
              Clear filters
            </button>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-100/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wines, regions, notes..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-wine-slate-900/80 backdrop-blur-md text-champagne-100 placeholder:text-champagne-100/40 font-sans tracking-wide focus:outline-none focus:ring-2 focus:ring-champagne-400/20 focus:border-champagne-400/50 transition-all duration-500 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-champagne-100/40 hover:text-champagne-100 transition-colors duration-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {(['all', 'store', 'restaurant'] as ContextFilter[]).map((ctx) => (
                  <button
                    key={ctx}
                    onClick={() => setContextFilter(contextFilter === ctx && ctx !== 'all' ? 'all' : ctx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-500 flex items-center gap-1.5 ${
                      contextFilter === ctx
                        ? 'bg-somm-red-500 text-champagne-100 border border-champagne-400/30'
                        : 'bg-wine-slate-900/60 text-champagne-100/60 border border-white/10 hover:border-champagne-400/30'
                    }`}
                  >
                    {ctx === 'store' && <Store className="w-3 h-3" />}
                    {ctx === 'restaurant' && <UtensilsCrossed className="w-3 h-3" />}
                    {ctx === 'all' ? 'All' : ctx === 'store' ? 'Store' : 'Restaurant'}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-white/10 flex-shrink-0" />

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {([
                  { key: 'all', label: 'All time' },
                  { key: 'week', label: 'Week' },
                  { key: 'month', label: 'Month' },
                  { key: '3months', label: '3 months' },
                ] as { key: DateFilter; label: string }[]).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setDateFilter(dateFilter === key && key !== 'all' ? 'all' : key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-500 ${
                      dateFilter === key
                        ? 'bg-somm-red-500 text-champagne-100 border border-champagne-400/30'
                        : 'bg-wine-slate-900/60 text-champagne-100/60 border border-white/10 hover:border-champagne-400/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-wine-slate-900/60 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Wine className="w-8 h-8 text-champagne-100/30" />
            </div>
            <p className="text-champagne-100/80 font-sans text-sm mb-1">No scans yet</p>
            <p className="text-champagne-100/60 font-sans tracking-wide text-xs mb-6">Scan a wine list to see your history here</p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-somm-red-900 text-champagne-100 border border-somm-red-500/30 px-5 py-2.5 rounded-xl text-sm font-sans font-medium hover:bg-somm-red-500 hover:border-champagne-400/50 hover:shadow-lg hover:shadow-somm-red-500/20 transition-all duration-500"
            >
              <ScanLine className="w-4 h-4" />
              Start your first scan
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl bg-wine-slate-900/60 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-champagne-100/30" />
            </div>
            <p className="text-champagne-100/80 font-sans text-sm mb-1">No matching scans</p>
            <p className="text-champagne-100/60 font-sans tracking-wide text-xs">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const topRec = session.recommendations?.[0];
              const isRestaurant = (session.context || 'store') === 'restaurant';
              return (
                <button
                  key={session.id}
                  onClick={() => navigate(`/history/${session.id}`)}
                  className="w-full text-left bg-wine-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-4 hover:border-champagne-400/30 hover:shadow-lg hover:shadow-champagne-400/5 transition-all duration-500 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      isRestaurant
                        ? 'bg-champagne-400/10 border-champagne-400/20'
                        : 'bg-vine-green/10 border-vine-green/20'
                    }`}>
                      {isRestaurant
                        ? <UtensilsCrossed className="w-5 h-5 text-champagne-400" />
                        : <Store className="w-5 h-5 text-vine-green" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-serif font-light text-champagne-100 truncate group-hover:text-champagne-400 transition-colors duration-500">
                          {topRec ? topRec.name : 'Wine scan'}
                        </p>
                        {topRec && (
                          <span className="text-xs bg-champagne-400/10 text-champagne-400 border border-champagne-400/20 px-2 py-0.5 rounded-full font-sans font-medium flex-shrink-0 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {topRec.match_score}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-champagne-100/50 font-sans tracking-wide mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(session.created_at)}
                        </span>
                        <span>{session.wines_detected?.length || 0} wines</span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {session.budget_min}-{session.budget_max}
                        </span>
                      </div>

                      {session.recommendations && session.recommendations.length > 1 && (
                        <div className="flex items-center gap-2 mt-2">
                          {session.recommendations.slice(1, 4).map((rec, i) => (
                            <span key={i} className="text-xs text-champagne-100/60 font-sans tracking-wide bg-wine-slate-900/60 border border-white/10 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                              {rec.name}
                            </span>
                          ))}
                          {session.recommendations.length > 4 && (
                            <span className="text-xs text-champagne-100/60 font-sans">
                              +{session.recommendations.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {session.notes && (
                        <p className="text-xs text-champagne-100/60 font-sans tracking-wide mt-1.5 truncate italic">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {session.notes}
                        </p>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-champagne-100/30 group-hover:text-champagne-400 group-hover:translate-x-0.5 transition-all duration-500 flex-shrink-0 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
