import { useState, useEffect } from 'react';
import { BookOpen, Loader2, Search, GlassWater, MapPin, Grape, Sparkles, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WineKnowledgeModal } from '../components/WineKnowledgeModal';

interface WineKnowledge {
  id: string;
  category: 'wine_type' | 'region' | 'grape' | 'flavor' | 'general';
  term: string;
  title: string;
  short_description: string;
}

type CategoryFilter = 'all' | 'wine_type' | 'region' | 'grape' | 'flavor' | 'general';

export default function Knowledge() {
  const [knowledge, setKnowledge] = useState<WineKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from('wine_knowledge')
        .select('id, category, term, title, short_description')
        .order('category')
        .order('title');

      if (error) throw error;
      setKnowledge(data || []);
    } catch (err) {
      console.error('Error loading wine knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      wine_type: GlassWater,
      region: MapPin,
      grape: Grape,
      flavor: Sparkles,
      general: Info,
    };
    const Icon = icons[category as keyof typeof icons] || Info;
    return <Icon size={16} />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      wine_type: 'text-purple-400 bg-purple-900/20 border-purple-500/20',
      region: 'text-blue-400 bg-blue-900/20 border-blue-500/20',
      grape: 'text-emerald-400 bg-emerald-900/20 border-emerald-500/20',
      flavor: 'text-amber-400 bg-amber-900/20 border-amber-500/20',
      general: 'text-stone-400 bg-stone-900/20 border-stone-500/20',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      wine_type: 'Wine Type',
      region: 'Region',
      grape: 'Grape',
      flavor: 'Flavor',
      general: 'Concept',
    };
    return labels[category as keyof typeof labels] || 'Knowledge';
  };

  const filteredKnowledge = knowledge.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories: { value: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <BookOpen size={14} /> },
    { value: 'wine_type', label: 'Wine Types', icon: <GlassWater size={14} /> },
    { value: 'region', label: 'Regions', icon: <MapPin size={14} /> },
    { value: 'grape', label: 'Grapes', icon: <Grape size={14} /> },
    { value: 'flavor', label: 'Flavors', icon: <Sparkles size={14} /> },
    { value: 'general', label: 'Concepts', icon: <Info size={14} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-champagne-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-somm-red-900/20 flex items-center justify-center border border-somm-red-500/20">
          <BookOpen className="w-5 h-5 text-somm-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-champagne-100">Wine Knowledge</h1>
          <p className="text-sm font-light text-stone-400">Learn about wines, regions, and flavors</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Search wine knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-wine-slate-900/50 text-champagne-100 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
              categoryFilter === cat.value
                ? 'bg-champagne-400 text-wine-900 shadow-sm shadow-champagne-400/20'
                : 'bg-white/5 text-stone-400 border border-white/10 hover:border-white/20 hover:text-stone-200 hover:bg-white/10'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-stone-500 mb-4 font-light">
        {filteredKnowledge.length} {filteredKnowledge.length === 1 ? 'result' : 'results'}
      </p>

      {/* Knowledge Cards */}
      {filteredKnowledge.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
          <p className="text-stone-400">No results found</p>
          <p className="text-sm text-stone-600 mt-1 font-light">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredKnowledge.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedTerm(item.term)}
              className="bg-wine-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-4 sm:p-5 text-left hover:border-white/10 hover:bg-wine-slate-900/60 transition-all group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${getCategoryColor(item.category)}`}>
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-1">
                    <h3 className="text-base sm:text-lg font-medium text-champagne-100 group-hover:text-champagne-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wide whitespace-nowrap">
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <p className="text-sm text-stone-400 leading-relaxed line-clamp-2 font-light">
                    {item.short_description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedTerm && (
        <WineKnowledgeModal
          term={selectedTerm}
          onClose={() => setSelectedTerm(null)}
        />
      )}
    </div>
  );
}
