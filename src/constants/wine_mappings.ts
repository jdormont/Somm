export type SpectrumRange = {
  min: number;
  max: number;
};

export type SpectrumMapping = {
  body?: SpectrumRange;
  sweetness?: SpectrumRange;
  tannins?: SpectrumRange;
  acidity?: SpectrumRange;
  earthiness?: SpectrumRange;
};

export const FLAVOR_TAG_MAPPINGS: Record<string, SpectrumMapping> = {
  'Bold & Full-bodied': { 
    body: { min: 7, max: 10 },
    tannins: { min: 6, max: 10 }
  },
  'Light & Crisp': { 
    body: { min: 1, max: 4 },
    acidity: { min: 7, max: 10 }
  },
  'Fruity': { 
    earthiness: { min: 1, max: 4 }, // Low earthiness = Fruit forward
    sweetness: { min: 3, max: 6 } // Implies not bone dry, but not necessarily sweet
  },
  'Dry': { 
    sweetness: { min: 1, max: 2 }
  },
  'Sweet': { 
    sweetness: { min: 7, max: 10 }
  },
  'Earthy': { 
    earthiness: { min: 7, max: 10 }
  },
  'Mineral': { 
    earthiness: { min: 5, max: 8 },
    acidity: { min: 6, max: 9 }
  },
  'Oaky': { 
    // Oak often correlates with fuller body and some tannins, but primarily it's a flavor. 
    // We might not map this strongly to a spectrum, or maybe body?
    body: { min: 6, max: 10 } 
  },
  'Tannic': { 
    tannins: { min: 7, max: 10 }
  },
  'Smooth': { 
    tannins: { min: 1, max: 4 },
    acidity: { min: 1, max: 5 }
  },
  'Floral': { 
    // Hard to map to spectrums directly, maybe acidity?
    acidity: { min: 5, max: 8 }
  },
  'Herbal': { 
    earthiness: { min: 5, max: 9 }
  },
  'Spicy': { 
    body: { min: 5, max: 9 }
  },
  'Citrusy': { 
    acidity: { min: 7, max: 10 },
    body: { min: 1, max: 5 }
  },
  'Buttery': { 
    body: { min: 6, max: 10 },
    acidity: { min: 1, max: 4 } // Low acidity usually with MLF
  },
};
