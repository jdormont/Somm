I need you to act as a Lead UI/UX Engineer and implement a new design system for our app, "Somm." We are moving away from a standard tech look to a "Modern Lifestyle/Concierge" aesthetic.

Please digest the following Design System Specifications and apply them to the components we build going forward.

### 1. THE VIBE (Atmosphere)
The app should feel like a dimly lit, high-end wine bar. Dark mode is the default. The interface should recede, letting the content (wine) shine.
- **Keywords:** Sophisticated, Organic, Fluid, "The Accessible Insider."
- **Texture:** Use subtle glassmorphism (backdrop-blur) and thin borders to create depth, avoiding heavy drop shadows.

### 2. COLOR PALETTE (Tailwind Config)
Please suggest updates to my `tailwind.config.js` to include these custom colors:
- **Backgrounds:**
  - `wine-slate-950`: #0f1115 (Deepest background)
  - `wine-slate-900`: #1a1d23 (Card background)
- **Primary Brand:**
  - `somm-red-900`: #2D1B22 (Deep Burgundy - for active states/headers)
  - `somm-red-500`: #783543 (Muted Pinot - for primary buttons, but desaturated)
- **Accents:**
  - `champagne-400`: #D4C4A3 (Gold/Beige - for highlights, ratings, and best matches)
  - `champagne-100`: #F5F0E6 (Off-white text)
- **Functional:**
  - `vine-green`: #4A5D44 (Organic green for "Value" badges)

### 3. TYPOGRAPHY
- **Headings:** Use a Serif font (e.g., 'Playfair Display', 'Merriweather'). Use this for Wine Names, "The Verdict," and Section Headers. It should feel editorial.
- **Body:** Use a clean Sans-Serif (e.g., 'Inter', 'Geist'). Use this for prices, technical data, and button text.
- **Styling Rule:** Headings should be lighter weight (font-light or font-normal) but larger. Body text should have relaxed tracking (tracking-wide).

### 4. UI PATTERNS & SHAPES
- **Cards:** Dark backgrounds (`bg-wine-slate-900/80`) with `backdrop-blur-md`.
- **Borders:** Extremely thin, subtle borders (`border border-white/10`). Active cards get a `border-champagne-400/30`.
- **Radius:** Standardize on `rounded-xl` or `rounded-2xl` for a soft, approachable feel. No sharp corners.

### 5. MOTION (Animation)
- Nothing should "pop." Everything should "flow."
- Use `duration-500` and `ease-out` for hover states.
- When loading recommendations, use a staggered fade-in-up effect.

---

**TASK:**
Based on the above, please create a new React component called `RecommendationCard.tsx`.
It should display:
1. A "Match Score" badge (Gold/Champagne color).
2. The Wine Name (Serif font, large).
3. The Region/Vintage (Sans serif, muted).
4. A "Why you'll love it" section that looks like a handwritten note.
5. A "Select" button that uses the `somm-red` palette but feels elegant, not aggressive.