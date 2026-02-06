/*
  # Create wine knowledge content system

  1. New Tables
    - `wine_knowledge`
      - `id` (uuid, primary key)
      - `category` (text, enum: 'wine_type', 'region', 'grape', 'flavor', 'general')
      - `term` (text, the wine term or concept being explained)
      - `title` (text, display title for the card)
      - `short_description` (text, brief 1-2 sentence summary)
      - `full_description` (text, comprehensive explanation)
      - `key_characteristics` (jsonb, array of key points)
      - `food_pairings` (jsonb, array of food pairing suggestions, optional)
      - `examples` (jsonb, array of example wines or regions, optional)
      - `learn_more_url` (text, optional external link)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Index on `term` for quick lookups
    - Index on `category` for filtering

  3. Security
    - Enable RLS on wine_knowledge table
    - All authenticated users can read wine knowledge content
    - Only admins can create/update/delete wine knowledge entries
*/

CREATE TABLE IF NOT EXISTS wine_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('wine_type', 'region', 'grape', 'flavor', 'general')),
  term text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text NOT NULL,
  full_description text NOT NULL,
  key_characteristics jsonb DEFAULT '[]'::jsonb,
  food_pairings jsonb DEFAULT '[]'::jsonb,
  examples jsonb DEFAULT '[]'::jsonb,
  learn_more_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wine_knowledge_term ON wine_knowledge(term);
CREATE INDEX IF NOT EXISTS idx_wine_knowledge_category ON wine_knowledge(category);

-- Enable RLS
ALTER TABLE wine_knowledge ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read wine knowledge
CREATE POLICY "Authenticated users can read wine knowledge"
  ON wine_knowledge FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert wine knowledge
CREATE POLICY "Admins can insert wine knowledge"
  ON wine_knowledge FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only admins can update wine knowledge
CREATE POLICY "Admins can update wine knowledge"
  ON wine_knowledge FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete wine knowledge
CREATE POLICY "Admins can delete wine knowledge"
  ON wine_knowledge FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Seed with initial wine knowledge content
INSERT INTO wine_knowledge (category, term, title, short_description, full_description, key_characteristics, food_pairings, examples) VALUES
(
  'wine_type',
  'red',
  'Red Wine',
  'Made from dark-colored grape varieties, red wines are fermented with grape skins to extract color, tannins, and complex flavors.',
  'Red wines range from light and fruity to bold and full-bodied. The color comes from anthocyanins in grape skins, which are left in contact with the juice during fermentation. Tannins from skins and seeds provide structure and aging potential. Temperature, oak aging, and grape variety all dramatically influence the final style.',
  '["Rich in tannins that provide structure", "Colors range from pale ruby to deep purple", "Often aged in oak barrels", "Best served at 60-65°F (15-18°C)", "Can age for decades in some cases"]',
  '["Red meat and game", "Hard cheeses", "Hearty pasta dishes", "Grilled vegetables", "Rich stews and braises"]',
  '["Cabernet Sauvignon", "Pinot Noir", "Merlot", "Syrah/Shiraz", "Tempranillo", "Sangiovese"]'
),
(
  'wine_type',
  'white',
  'White Wine',
  'Produced from green or yellow grapes with minimal skin contact, white wines are known for their refreshing acidity and bright fruit flavors.',
  'White wines are typically fermented without grape skins, resulting in lighter colors and more delicate flavors. Styles range from bone-dry and mineral-driven to rich and buttery. Some whites see oak aging for added complexity, while others showcase pure fruit character. Acidity is key to balance and food pairing versatility.',
  '["Crisp acidity provides refreshment", "Colors from pale straw to deep gold", "Served chilled at 45-50°F (7-10°C)", "Can be still or sparkling", "Some age beautifully, others drink young"]',
  '["Seafood and shellfish", "Poultry", "Creamy pasta dishes", "Fresh salads", "Soft cheeses"]',
  '["Chardonnay", "Sauvignon Blanc", "Riesling", "Pinot Grigio", "Chenin Blanc", "Albariño"]'
),
(
  'wine_type',
  'sparkling',
  'Sparkling Wine',
  'Wines with significant levels of carbon dioxide, creating bubbles. Traditional method Champagne is the most famous, but many regions produce exceptional sparkling wines.',
  'Sparkling wines gain their effervescence through secondary fermentation, either in bottle (traditional method) or in tank (Charmat method). The finest examples undergo years of aging on their lees, developing complex toasty, brioche-like flavors. Styles range from bone-dry (Brut Nature) to sweet (Doux), with most Champagne and Prosecco falling in the Brut category.',
  '["CO2 creates persistent bubbles", "Traditional method adds complexity", "Pressure in bottle is 5-6 atmospheres", "Best served well-chilled at 40-45°F", "Versatile food pairing wine"]',
  '["Oysters and caviar", "Fried foods (bubbles cut richness)", "Soft cheeses", "Light appetizers", "Celebrations!"]',
  '["Champagne (France)", "Prosecco (Italy)", "Cava (Spain)", "Crémant (France)", "Sekt (Germany)"]'
),
(
  'region',
  'bordeaux',
  'Bordeaux',
  'The world''s most famous wine region in southwest France, known for structured red blends and exceptional aging potential.',
  'Bordeaux produces predominantly red wines from Cabernet Sauvignon and Merlot, often blended with Cabernet Franc, Petit Verdot, and Malbec. The region is divided by the Gironde estuary: Left Bank (Médoc, Graves) favors Cabernet Sauvignon on gravelly soils, while Right Bank (Pomerol, Saint-Émilion) specializes in Merlot on clay-limestone. A classification system from 1855 still influences prestige and pricing today.',
  '["Blends are the signature style", "Left Bank: Cabernet-dominant, structured", "Right Bank: Merlot-dominant, softer", "Maritime climate moderates extremes", "Top wines age 20-50+ years"]',
  '["Roast lamb with herbs", "Beef Wellington", "Duck confit", "Aged hard cheeses", "Mushroom dishes"]',
  '["Château Margaux", "Château Lafite Rothschild", "Pétrus", "Château Haut-Brion", "Château Palmer"]'
),
(
  'region',
  'burgundy',
  'Burgundy',
  'A prestigious French region producing sublime Pinot Noir and Chardonnay from a complex patchwork of terroir-driven vineyard sites.',
  'Burgundy (Bourgogne) is all about terroir - the same grape variety can taste completely different from one village or vineyard to the next. The region uses a classification system of Grand Cru, Premier Cru, Village, and Regional wines. Single-varietal wines are the rule: Pinot Noir for reds, Chardonnay for whites. Small family estates dominate, and top bottles command extraordinary prices due to limited production.',
  '["Terroir is everything - site matters most", "Pinot Noir and Chardonnay only", "Tiny vineyard parcels create rarity", "Cool continental climate", "Wines express minerality and elegance"]',
  '["Wild mushrooms and truffles", "Roast chicken with herbs", "Salmon and rich fish", "Brie and Époisses cheese", "Coq au vin"]',
  '["Romanée-Conti", "Montrachet", "Chambertin", "Chablis", "Meursault"]'
),
(
  'region',
  'napa-valley',
  'Napa Valley',
  'California''s most celebrated wine region, renowned for powerful, opulent Cabernet Sauvignon and world-class Chardonnay.',
  'Napa Valley stretches 30 miles north of San Francisco, with diverse microclimates and soil types creating distinct sub-regions. Cabernet Sauvignon dominates, producing rich, full-bodied reds with ripe fruit and smooth tannins. The valley floor is warmer, while mountain vineyards see cooler temperatures and produce more structured wines. Cult Cabernets can command thousands per bottle, but excellent wines exist at every price point.',
  '["Mediterranean climate with cool fog", "Cabernet Sauvignon is king", "Mountain vs. valley floor differences", "Premium quality, premium prices", "Modern winemaking with French influence"]',
  '["Grilled ribeye steak", "BBQ ribs", "Aged cheddar", "Dark chocolate", "Lamb chops"]',
  '["Screaming Eagle", "Harlan Estate", "Opus One", "Caymus", "Silver Oak"]'
),
(
  'flavor',
  'oaky',
  'Oaky',
  'A flavor profile from barrel aging, adding vanilla, toast, and spice notes to wine.',
  'Oak aging contributes both flavor and texture. New oak barrels impart stronger oak character with vanilla, coconut, toast, smoke, and baking spice notes. French oak tends toward subtle spice and elegance, while American oak delivers bolder vanilla and coconut. The level of toast (light, medium, heavy) also affects flavor. Over-oaking can overwhelm fruit, but balanced oak integration adds complexity and aging potential.',
  '["Vanilla and butterscotch notes", "Toast and caramel flavors", "Adds creamy texture", "More common in reds and Chardonnay", "French oak: subtle; American oak: bold"]',
  '["Grilled foods with char", "Creamy sauces", "Roasted meats", "Butternut squash", "Aged Gouda"]',
  '["California Chardonnay", "Rioja Reserva", "Napa Cabernet", "Australian Shiraz"]'
),
(
  'flavor',
  'fruity',
  'Fruity',
  'Wines expressing fresh, vibrant fruit flavors - from citrus and berries to stone fruit and tropical notes.',
  'Fruitiness in wine comes from aromatic compounds in the grapes themselves, not from added fruit. The type of fruit character depends on grape variety, climate, and ripeness at harvest. Cool climates produce tart red fruits (cranberry, raspberry) and citrus. Warm climates yield ripe dark fruits (blackberry, plum) and tropical notes. Young wines show primary fruit; aged wines develop dried fruit and jammy characteristics.',
  '["Reflects grape variety and climate", "Primary aroma in young wines", "Red fruits vs. dark fruits", "Citrus vs. tropical in whites", "Fruit-forward is not the same as sweet"]',
  '["Fresh fruit desserts", "Lighter proteins like chicken", "Grilled vegetables", "Summer salads", "Soft cheeses"]',
  '["Beaujolais", "New Zealand Sauvignon Blanc", "Argentinian Malbec", "Australian Shiraz"]'
),
(
  'flavor',
  'mineral',
  'Mineral',
  'A distinctive non-fruit character suggesting wet stone, chalk, slate, or sea spray - often linked to vineyard soil.',
  'Minerality is one of wine''s most debated descriptors. It describes a sensation of stone, flint, or salinity rather than fruit or oak. While the direct link between soil minerals and wine flavor is scientifically unclear, certain terroirs consistently produce wines with mineral character. Cool climate whites, especially from limestone, slate, or volcanic soils, often display pronounced minerality. It adds complexity and food-pairing versatility.',
  '["Wet stone, flint, chalk flavors", "Common in cool-climate whites", "Associated with certain soils", "Adds freshness and lift", "Prized in Chablis, Riesling, Sancerre"]',
  '["Raw oysters", "Grilled fish", "Goat cheese", "Sushi", "Vegetable-forward dishes"]',
  '["Chablis", "Sancerre", "German Riesling", "Assyrtiko", "Albariño"]'
),
(
  'grape',
  'cabernet-sauvignon',
  'Cabernet Sauvignon',
  'The world''s most planted red grape, producing full-bodied, age-worthy wines with blackcurrant fruit and firm tannins.',
  'Cabernet Sauvignon thrives in warm climates, developing thick skins that contribute deep color, bold tannins, and concentrated flavor. Classic notes include blackcurrant, cedar, tobacco, and bell pepper. The grape is often blended with Merlot and Cabernet Franc (Bordeaux style) for complexity. In California, Chile, and Australia, it shines as a varietal wine. Cabernet ages gracefully, developing leather, earth, and dried fruit over decades.',
  '["Full-bodied with firm tannins", "Blackcurrant and cedar flavors", "Ages exceptionally well", "Thrives in warm, dry climates", "Often blended with Merlot"]',
  '["Prime rib and beef", "Lamb with herbs", "Strong cheeses", "Grilled portobello mushrooms", "Dark chocolate"]',
  '["Bordeaux (France)", "Napa Valley (USA)", "Maipo Valley (Chile)", "Coonawarra (Australia)"]'
),
(
  'grape',
  'pinot-noir',
  'Pinot Noir',
  'A notoriously finicky grape producing elegant, aromatic reds with red fruit, earth, and silky texture.',
  'Pinot Noir is the ultimate terroir-expressive grape, reflecting even subtle differences in vineyard site. It requires cool climates and careful viticulture due to thin skins and tight clusters prone to rot. At its best, Pinot Noir offers perfumed aromatics (cherry, raspberry, rose, forest floor), bright acidity, and supple tannins. It''s the red grape of Burgundy, Oregon, and New Zealand''s Central Otago, producing wines that range from delicate to surprisingly powerful.',
  '["Light to medium body, silky texture", "Red cherry and raspberry fruit", "Earthy, mushroom, truffle notes", "Requires cool climate", "Expresses terroir beautifully"]',
  '["Duck and game birds", "Salmon and tuna", "Mushroom risotto", "Soft cheeses like Brie", "Roasted chicken"]',
  '["Burgundy (France)", "Willamette Valley (USA)", "Central Otago (New Zealand)", "Sonoma Coast (USA)"]'
),
(
  'grape',
  'chardonnay',
  'Chardonnay',
  'The world''s most versatile white grape, capable of producing everything from crisp, unoaked wines to rich, buttery expressions.',
  'Chardonnay is a winemaker''s canvas, reflecting site, climate, and cellar decisions. In cool climates (Chablis, Tasmania), it shows citrus, green apple, and minerality. In warmer regions (California, Australia), expect ripe stone fruit and tropical notes. Oak aging adds vanilla and toast; malolactic fermentation contributes buttery texture. Lees stirring increases richness. This adaptability makes Chardonnay both ubiquitous and capable of greatness.',
  '["Extremely versatile and adaptable", "Citrus in cool climates, tropical in warm", "Can be oaked or unoaked", "Often undergoes malolactic fermentation", "Ranges from lean to rich"]',
  '["Lobster with butter", "Roast chicken", "Creamy pasta", "Baked fish", "Triple-cream cheeses"]',
  '["Burgundy (France)", "Champagne (France)", "California (USA)", "Margaret River (Australia)"]'
),
(
  'grape',
  'sauvignon-blanc',
  'Sauvignon Blanc',
  'A zesty, aromatic white grape known for high acidity, herbaceous notes, and vibrant citrus and tropical fruit.',
  'Sauvignon Blanc delivers instant refreshment with piercing acidity and expressive aromatics. Cool climates produce grassy, herbal, and gooseberry notes (Sancerre, Marlborough), while warmer areas yield tropical fruit and citrus (California). The grape is usually fermented in stainless steel to preserve freshness, though some producers use oak for added complexity (often labeled Fumé Blanc). It''s one of the world''s most food-friendly wines.',
  '["High acidity, crisp and refreshing", "Grapefruit, lime, and gooseberry", "Grass, green bell pepper, jalapeño", "Usually unoaked and fresh", "Best consumed young"]',
  '["Goat cheese and salads", "Oysters and shellfish", "Fresh herbs and pesto", "Asparagus and green vegetables", "Ceviche and citrus dishes"]',
  '["Sancerre (France)", "Marlborough (New Zealand)", "Napa Valley (USA)", "Rueda (Spain)"]'
),
(
  'general',
  'tannins',
  'Tannins',
  'Naturally occurring polyphenols that create a drying, astringent sensation in your mouth, providing structure to red wines.',
  'Tannins come primarily from grape skins, seeds, and stems, as well as oak barrels. They feel textural rather than taste like a flavor - imagine the drying sensation of over-steeped tea. Tannins act as a preservative, allowing red wines to age and develop complexity. Young, tannic wines can feel harsh, but with time they soften and integrate. Tannins also bind with proteins, which is why red wine pairs so well with steak.',
  '["Create a drying, astringent mouthfeel", "Come from skins, seeds, and oak", "Essential for red wine aging", "Soften over time", "Pair well with protein and fat"]',
  '["Red meat and steak", "Hard aged cheeses", "Roasted or grilled foods", "Dishes with fat to balance", "Avoid with spicy foods (amplifies heat)"]',
  '["Young Bordeaux", "Barolo", "Cabernet Sauvignon", "Nebbiolo"]'
),
(
  'general',
  'acidity',
  'Acidity',
  'The tart, refreshing quality in wine that makes your mouth water - essential for balance, structure, and food pairing.',
  'Acidity in wine comes from natural acids in grapes: tartaric, malic, and citric. It provides freshness, brightness, and lift. High-acid wines taste crisp and lively; low-acid wines feel flat or flabby. Cool climates and early harvests preserve acidity, while warm climates and late harvests reduce it. Acidity is crucial for aging (acts as a preservative) and food pairing (cuts through fat, balances salt). White wines generally show more noticeable acidity than reds.',
  '["Makes your mouth water", "Provides freshness and balance", "Essential for aging", "Cuts through rich, fatty foods", "Higher in cool-climate wines"]',
  '["Fried foods and rich sauces", "Seafood and citrus", "Tangy cheeses", "Tomato-based dishes", "Salads with vinaigrette"]',
  '["Riesling", "Champagne", "Sauvignon Blanc", "Chianti", "Sancerre"]'
);
