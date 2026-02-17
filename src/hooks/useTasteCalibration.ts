
import { useMemo } from 'react';

export interface TasteAnchor {
  id: string;
  wine_name: string;
  producer: string;
  vintage?: string;
  profile_data: {
    body?: number;
    sweetness?: number; // Not always returned by analyzed-wine, but good to have
    tannin?: number;
    acidity?: number;
    earthiness?: number;
    oak?: number;
  };
}

export interface SuggestedProfile {
    body: number;
    sweetness: number;
    tannins: number;
    acidity: number;
    earthiness: number;
}

export function useTasteCalibration(anchors: TasteAnchor[]) {
  const suggestedProfile = useMemo(() => {
    if (anchors.length === 0) return null;

    const totals = {
      body: 0,
      sweetness: 0,
      tannin: 0,
      acidity: 0,
      earthiness: 0,
    };

    const counts = {
      body: 0,
      sweetness: 0,
      tannin: 0,
      acidity: 0,
      earthiness: 0,
    };

    anchors.forEach(anchor => {
        const p = anchor.profile_data;
        if (typeof p.body === 'number') { totals.body += p.body; counts.body++; }
        // Default sweetness if missing (assume dry-ish for most reds, adjust later if we want smarter defaults)
        const sweetVal = typeof p.sweetness === 'number' ? p.sweetness : 1; 
        totals.sweetness += sweetVal; counts.sweetness++;

        if (typeof p.tannin === 'number') { totals.tannin += p.tannin; counts.tannin++; }
        if (typeof p.acidity === 'number') { totals.acidity += p.acidity; counts.acidity++; }
        // Map "oak" or "earth" to earthiness? 
        // Let's assume earthiness is a mix of earthy + oak notes or direct mapping.
        // The edge function returns "earthiness" and "oak". 
        // Our slider is "Fruit-Forward" (1) vs "Savory/Earthy" (10).
        // Oak often adds savory/spicy notes, so we can blend them or just use earthiness.
        if (typeof p.earthiness === 'number') { totals.earthiness += p.earthiness; counts.earthiness++; }
    });

    const avg = (key: keyof typeof totals) => counts[key] > 0 ? Math.round(totals[key] / counts[key]) : 5;

    return {
        body: avg('body'),
        sweetness: avg('sweetness'),
        tannins: avg('tannin'),
        acidity: avg('acidity'),
        earthiness: avg('earthiness'),
    };
  }, [anchors]);

  return { suggestedProfile };
}
