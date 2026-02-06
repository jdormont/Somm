import { useState, useEffect } from 'react';
import { Wine, Plus, Star, Loader2, Trash2, MapPin, DollarSign, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange'];

function StarRating({ rating, onChange, size = 'md' }: { rating: number; onChange?: (r: number) => void; size?: 'sm' | 'md' }) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          disabled={!onChange}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function AddWineForm({ onAdd, onCancel }: { onAdd: () => void; onCancel: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [producer, setProducer] = useState('');
  const [vintage, setVintage] = useState('');
  const [type, setType] = useState('Red');
  const [region, setRegion] = useState('');
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);

    await supabase.from('wine_memories').insert({
      user_id: user.id,
      name: name.trim(),
      producer: producer.trim(),
      vintage: vintage.trim(),
      type,
      region: region.trim(),
      rating,
      notes: notes.trim(),
      price: price ? Number(price) : null,
    });

    setSaving(false);
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-stone-900 uppercase tracking-wider">Add a Wine Memory</h3>
        <button type="button" onClick={onCancel} className="text-stone-400 hover:text-stone-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Wine Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Caymus Cabernet Sauvignon"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Producer</label>
          <input
            type="text"
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            placeholder="e.g., Caymus Vineyards"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Vintage</label>
          <input
            type="text"
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="e.g., 2020"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Type</label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm pr-10"
            >
              {WINE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Region</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., Napa Valley, California"
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Price</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">Your Rating</label>
          <div className="py-2">
            <StarRating rating={rating} onChange={setRating} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-stone-600 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you think? e.g., 'Loved the dark cherry and vanilla. Smooth finish. Would buy again.'"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-wine-800/20 focus:border-wine-800 transition-all text-sm resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full bg-wine-800 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-wine-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save to Cellar'}
      </button>
    </form>
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
        <Loader2 className="w-6 h-6 text-wine-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center">
            <Wine className="w-5 h-5 text-wine-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Cellar</h1>
            <p className="text-sm text-stone-500">Wines you've tried and rated</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-wine-800 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-wine-900 transition-all hover:shadow-md hover:shadow-wine-800/10"
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
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{memories.length}</p>
            <p className="text-xs text-stone-500 mt-0.5">Wines Tried</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{avgRating}</p>
            <p className="text-xs text-stone-500 mt-0.5">Avg Rating</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{loved}</p>
            <p className="text-xs text-stone-500 mt-0.5">Loved</p>
          </div>
        </div>
      )}

      {memories.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
              filterRating === null
                ? 'bg-wine-800 text-white'
                : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
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
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 flex items-center gap-1 ${
                  filterRating === r
                    ? 'bg-wine-800 text-white'
                    : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-300'
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
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Wine className="w-8 h-8 text-stone-300" />
          </div>
          <p className="text-stone-500 text-sm mb-1">No wines in your cellar yet</p>
          <p className="text-stone-400 text-xs mb-6">Start adding wines you've tried to build your taste profile</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-wine-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-wine-900 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first wine
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-stone-400 py-8">No wines with that rating</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((memory) => (
            <div
              key={memory.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-stone-300 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  memory.rating >= 4 ? 'bg-emerald-50' : memory.rating <= 2 ? 'bg-red-50' : 'bg-stone-50'
                }`}>
                  <Wine className={`w-5 h-5 ${
                    memory.rating >= 4 ? 'text-emerald-600' : memory.rating <= 2 ? 'text-red-500' : 'text-stone-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-stone-900 leading-tight">{memory.name}</h3>
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
                      <span className="px-2 py-0.5 bg-stone-50 rounded-full">{memory.type}</span>
                    )}
                    {memory.vintage && <span>{memory.vintage}</span>}
                    {memory.region && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {memory.region}
                      </span>
                    )}
                    {memory.price != null && (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        ${memory.price}
                      </span>
                    )}
                    <span className={`font-medium ${
                      memory.rating >= 4 ? 'text-emerald-600' : memory.rating <= 2 ? 'text-red-500' : 'text-stone-500'
                    }`}>
                      {ratingLabels[memory.rating]}
                    </span>
                  </div>

                  {memory.notes && (
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed italic">"{memory.notes}"</p>
                  )}
                </div>

                <button
                  onClick={() => deleteMemory(memory.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {memories.length > 0 && (
        <div className="mt-8 p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-xs text-stone-500 leading-relaxed">
            Your cellar data is used to personalize wine recommendations. Wines you rated highly tell us what you love,
            and lower-rated wines help us steer you away from similar profiles. The more you rate, the better your picks get.
          </p>
        </div>
      )}
    </div>
  );
}
