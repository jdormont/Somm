import { useState } from 'react';
import { Plus, Loader2, X, ChevronDown, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange'];

interface AddWineFormProps {
  onAdd: () => void;
  onCancel: () => void;
  initialData?: {
    name?: string;
    producer?: string;
    vintage?: string;
    type?: string;
    region?: string;
    price?: number;
    notes?: string;
  };
}

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
              star <= rating ? 'text-champagne-400 fill-champagne-400' : 'text-stone-700'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function AddWineForm({ onAdd, onCancel, initialData = {} }: AddWineFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialData.name || '');
  const [producer, setProducer] = useState(initialData.producer || '');
  const [vintage, setVintage] = useState(initialData.vintage || '');
  const [type, setType] = useState(initialData.type || 'Red');
  const [region, setRegion] = useState(initialData.region || '');
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [price, setPrice] = useState(initialData.price ? String(initialData.price) : '');
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
    <form onSubmit={handleSubmit} className="bg-wine-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-champagne-100 uppercase tracking-wider">Add to Cellar</h3>
        <button type="button" onClick={onCancel} className="text-stone-400 hover:text-champagne-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Wine Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Caymus Cabernet Sauvignon"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Producer</label>
          <input
            type="text"
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            placeholder="e.g., Caymus Vineyards"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Vintage</label>
          <input
            type="text"
            value={vintage}
            onChange={(e) => setVintage(e.target.value)}
            placeholder="e.g., 2020"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Type</label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm pr-10 backdrop-blur-sm"
            >
              {WINE_TYPES.map((t) => (
                <option key={t} value={t} className="bg-wine-slate-900 text-champagne-100">{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Region</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g., Napa Valley, California"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Price</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-sm">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min={0}
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm backdrop-blur-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Your Rating</label>
          <div className="py-2">
            <StarRating rating={rating} onChange={setRating} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-champagne-100/70 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you think? e.g., 'Loved the dark cherry and vanilla. Smooth finish. Would buy again.'"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm resize-none backdrop-blur-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="w-full bg-somm-red-900/90 text-champagne-100 py-3 rounded-xl font-medium text-sm hover:bg-somm-red-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-somm-red-500/30 shadow-lg hover:shadow-somm-red-900/20"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save to Cellar'}
      </button>
    </form>
  );
}
