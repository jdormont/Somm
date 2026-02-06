import { X, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface WineKnowledge {
  id: string;
  category: 'wine_type' | 'region' | 'grape' | 'flavor' | 'general';
  term: string;
  title: string;
  short_description: string;
  full_description: string;
  key_characteristics: string[];
  food_pairings: string[];
  examples: string[];
  learn_more_url?: string;
}

interface WineKnowledgeModalProps {
  term: string;
  onClose: () => void;
}

export function WineKnowledgeModal({ term, onClose }: WineKnowledgeModalProps) {
  const [knowledge, setKnowledge] = useState<WineKnowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKnowledge();
  }, [term]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('wine_knowledge')
        .select('*')
        .eq('term', term.toLowerCase())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('No information found for this term.');
        return;
      }

      setKnowledge(data);
    } catch (err) {
      console.error('Error fetching wine knowledge:', err);
      setError('Failed to load wine information.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors = {
      wine_type: 'bg-purple-100 text-purple-800',
      region: 'bg-blue-100 text-blue-800',
      grape: 'bg-green-100 text-green-800',
      flavor: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      wine_type: 'Wine Type',
      region: 'Region',
      grape: 'Grape Variety',
      flavor: 'Flavor Profile',
      general: 'Wine Concept',
    };
    return labels[category as keyof typeof labels] || 'Wine Knowledge';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            {knowledge && (
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor(knowledge.category)}`}>
                  {getCategoryLabel(knowledge.category)}
                </span>
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : knowledge?.title || 'Wine Knowledge'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
              <p className="mt-2 text-gray-600">Loading wine knowledge...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {knowledge && !loading && (
            <div className="space-y-6">
              {/* Short Description */}
              <div>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {knowledge.short_description}
                </p>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {knowledge.full_description}
                </p>
              </div>

              {/* Key Characteristics */}
              {knowledge.key_characteristics.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Key Characteristics
                  </h3>
                  <ul className="space-y-2">
                    {knowledge.key_characteristics.map((char, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Food Pairings */}
              {knowledge.food_pairings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Perfect Pairings
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {knowledge.food_pairings.map((pairing, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-sm"
                      >
                        {pairing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {knowledge.examples.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                    Examples to Try
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {knowledge.examples.map((example, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learn More Link */}
              {knowledge.learn_more_url && (
                <div className="pt-4 border-t">
                  <a
                    href={knowledge.learn_more_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Learn more
                    <ExternalLink size={16} className="ml-1" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
