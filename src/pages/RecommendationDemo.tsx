import { RecommendationCard } from '../components/RecommendationCard';

const sampleWines = [
  {
    id: '1',
    name: 'Château Margaux',
    producer: 'Château Margaux',
    region: 'Margaux, Bordeaux',
    vintage: 2015,
    price: 450,
    match_score: 95,
    type: 'Red',
    reasoning: 'This elegant Bordeaux showcases the refined complexity you appreciate, with notes of blackcurrant, violet, and cedar that evolve beautifully in the glass. Its silky tannins and perfect balance make it an exceptional pairing for your preferences.',
  },
  {
    id: '2',
    name: 'Domaine de la Romanée-Conti',
    producer: 'DRC',
    region: 'Burgundy, France',
    vintage: 2018,
    price: 850,
    match_score: 92,
    type: 'Red',
    reasoning: 'A masterpiece of Burgundy that delivers the elegance and terroir-driven character you seek. Layers of red fruit, earth, and spice unfold with remarkable finesse.',
  },
  {
    id: '3',
    name: 'Krug Grande Cuvée',
    producer: 'Krug',
    region: 'Champagne, France',
    price: 280,
    match_score: 88,
    type: 'Sparkling',
    reasoning: 'This prestige champagne offers the complexity and depth you value, with brioche, hazelnut, and citrus notes that create an unforgettable celebration in every sip.',
  },
];

export function RecommendationDemo() {
  const handleSelect = (wineId: string) => {
    console.log('Selected wine:', wineId);
    alert(`Selected wine: ${wineId}`);
  };

  return (
    <div className="min-h-screen bg-wine-slate-950 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="font-serif font-light text-5xl sm:text-6xl text-champagne-100 mb-4">
            Curated for You
          </h1>
          <p className="font-sans text-champagne-100/60 tracking-wide text-lg">
            Hand-selected wines that match your refined palate
          </p>
        </header>

        <div className="space-y-6">
          {sampleWines.map((wine, index) => (
            <RecommendationCard
              key={wine.id}
              wine={wine}
              index={index}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <footer className="mt-16 text-center">
          <p className="font-sans text-sm text-champagne-100/40 tracking-wider">
            Design System: Modern Lifestyle Concierge
          </p>
        </footer>
      </div>
    </div>
  );
}
