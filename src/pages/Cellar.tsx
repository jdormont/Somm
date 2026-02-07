import { useState, useEffect } from 'react';
import { Wine, Plus, Star, Loader2, Trash2, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AddWineForm from '../components/AddWineForm';

interface WineMemory {
  id: string;
  name: string;
  producer: string;
  vintage: string;
  type: string;
  region: string;
  rating: number;
  notes: string;
  price: number | null;
  created_at: string;
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star}>
          <Star
            className={`${starSize} ${
              star <= rating ? 'text-champagne-400 fill-champagne-400' : 'text-stone-700'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

const ratingLabels: Record<number, string> = {
  1: 'Disliked',
  2: 'Meh',
  3: 'Decent',
  4: 'Loved it',
  5: 'Outstanding',
};

export default function Cellar() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<WineMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    if (user) loadMemories();
  }, [user]);

  const loadMemories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wine_memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMemories(data || []);
    setLoading(false);
  };

  const deleteMemory = async (id: string) => {
    await supabase.from('wine_memories').delete().eq('id', id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAdded = () => {
    setShowForm(false);
    loadMemories();
  };

  const filtered = filterRating
    ? memories.filter((m) => m.rating === filterRating)
    : memories;

  const avgRating = memories.length > 0
    ? (memories.reduce((sum, m) => sum + m.rating, 0) / memories.length).toFixed(1)
    : '0';

  const loved = memories.filter((m) => m.rating >= 4).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-champagne-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-somm-red-900/20 flex items-center justify-center border border-somm-red-500/20">
            <Wine className="w-5 h-5 text-somm-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-champagne-100">My Cellar</h1>
            <p className="text-sm font-light text-stone-400">Wines you've tried and rated</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-somm-red-900/80 text-champagne-100 px-4 py-2.5 rounded-full text-sm font-medium hover:bg-somm-red-800 transition-all hover:shadow-lg hover:shadow-somm-red-900/20 border border-somm-red-500/30"
          >
            <Plus className="w-4 h-4" />
            Add wine
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <AddWineForm onAdd={handleAdded} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {memories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center">
            <p className="text-2xl font-serif text-champagne-100">{memories.length}</p>
            <p className="text-xs text-stone-500 mt-0.5 uppercase tracking-wider">Wines Tried</p>
          </div>
          <div className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center">
            <p className="text-2xl font-serif text-champagne-400">{avgRating}</p>
            <p className="text-xs text-stone-500 mt-0.5 uppercase tracking-wider">Avg Rating</p>
          </div>
          <div className="bg-wine-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center">
            <p className="text-2xl font-serif text-emerald-400/80">{loved}</p>
            <p className="text-xs text-stone-500 mt-0.5 uppercase tracking-wider">Loved</p>
          </div>
        </div>
      )}

      {memories.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 border ${
              filterRating === null
                ? 'bg-champagne-400/20 text-champagne-100 border-champagne-400/30'
                : 'bg-transparent text-stone-500 border-white/10 hover:border-white/20 hover:text-stone-300'
            }`}
          >
            All ({memories.length})
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const count = memories.filter((m) => m.rating === r).length;
            if (count === 0) return null;
            return (
              <button
                key={r}
                onClick={() => setFilterRating(filterRating === r ? null : r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 flex items-center gap-1 border ${
                  filterRating === r
                    ? 'bg-champagne-400/20 text-champagne-100 border-champagne-400/30'
                    : 'bg-transparent text-stone-500 border-white/10 hover:border-white/20 hover:text-stone-300'
                }`}
              >
                {r}<Star className="w-3 h-3 fill-current" /> ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && memories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Wine className="w-8 h-8 text-stone-500" />
          </div>
          <p className="text-stone-400 text-sm mb-1">No wines in your cellar yet</p>
          <p className="text-stone-600 text-xs mb-6 max-w-xs mx-auto">Start adding wines you've tried to build your taste profile</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-somm-red-900/80 text-champagne-100 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-somm-red-800 transition-colors border border-somm-red-500/30"
          >
            <Plus className="w-4 h-4" />
            Add your first wine
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-stone-500 py-8">No wines with that rating</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((memory) => (
            <div
              key={memory.id}
              className="bg-wine-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group hover:bg-wine-slate-900/60"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${
                  memory.rating >= 4 ? 'bg-emerald-500/10 text-emerald-400' : memory.rating <= 2 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-stone-400'
                }`}>
                  <Wine className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-champagne-100 leading-tight">{memory.name}</h3>
                      {memory.producer && (
                        <p className="text-xs text-stone-500 mt-0.5">{memory.producer}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <StarRating rating={memory.rating} size="sm" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-500">
                    {memory.type && (
                      <span className="px-2 py-0.5 bg-white/5 rounded-full border border-white/5 text-stone-400">{memory.type}</span>
                    )}
                    {memory.vintage && <span className="text-stone-400">{memory.vintage}</span>}
                    {memory.region && (
                      <span className="flex items-center gap-0.5 text-stone-400">
                        <MapPin className="w-3 h-3" />
                        {memory.region}
                      </span>
                    )}
                    {memory.price != null && (
                      <span className="flex items-center gap-0.5 text-stone-400">
                        <DollarSign className="w-3 h-3" />
                        ${memory.price}
                      </span>
                    )}
                    <span className={`font-medium ${
                      memory.rating >= 4 ? 'text-emerald-400/80' : memory.rating <= 2 ? 'text-red-400/80' : 'text-stone-400'
                    }`}>
                      {ratingLabels[memory.rating]}
                    </span>
                  </div>

                  {memory.notes && (
                    <p className="text-sm text-champagne-100/90 leading-relaxed font-light mt-2 border-l-2 border-champagne-400/20 pl-3">"{memory.notes}"</p>
                  )}
                </div>

                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="text-stone-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {memories.length > 0 && (
        <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-xs text-stone-500 leading-relaxed text-center">
            Your cellar data is used to personalize wine recommendations. Wines you rated highly tell us what you love,
            and lower-rated wines help us steer you away from similar profiles.
          </p>
        </div>
      )}
    </div>
  );
}
