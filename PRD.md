# Somm - Product Requirements Document

## Vision

Somm is a personal wine advisor that eliminates the anxiety of choosing wine. Whether standing in a store aisle or sitting at a restaurant, users photograph a wine list and receive ranked, personalized recommendations in seconds -- powered by their taste history, preferences, and budget.

---

## Goals

1. **Reduce decision friction** -- Turn a 10-minute deliberation into a confident 30-second choice.
2. **Build taste intelligence over time** -- Every scan and rating sharpens future recommendations, creating a flywheel of improving accuracy.
3. **Respect real-world constraints** -- Budget, context (store vs. restaurant markup), dietary avoidances, and occasion all factor into every recommendation.
4. **Control access and cost** -- Admin approval gates new users to manage API token spend and keep the platform invite-only during early growth.

---

## Target Users

- Wine-curious individuals who enjoy wine but lack the expertise to navigate large selections confidently.
- Regular diners and home entertainers who want reliable picks without studying wine professionally.
- Small wine clubs or friend groups who want a shared discovery tool (future).

---

## Phase 1: Core Intelligence (Completed)

### Wine Scanner

- Upload a photo of any wine list, shelf, or menu.
- GPT-4 Vision reads and identifies every wine, producer, vintage, and price.
- Returns up to 5 ranked recommendations with match scores (0-100).
- Each recommendation includes reasoning, tasting notes, critic references, and food pairings.
- Context toggle between Store and Restaurant adjusts pricing expectations automatically.
- Optional notes field for occasion or pairing context ("grilling steak tonight", "anniversary dinner").

### Taste Profile

- Multi-select preferences for wine types (Red, White, Rose, Sparkling, Dessert, Fortified, Orange).
- Region preferences spanning 19 wine regions worldwide.
- 15 flavor profile descriptors (Bold, Crisp, Fruity, Oaky, Mineral, etc.).
- Avoidance list for dealbreakers (high tannins, heavy oak, very sweet, etc.).
- Adventurousness dial: Play it safe / Open-minded / Surprise me.
- Separate default budgets for store and restaurant contexts.

### Wine Cellar

- Personal log of every wine tried, with name, producer, vintage, type, region, price, rating (1-5 stars), and tasting notes.
- Wines can be added manually or saved directly from scan recommendations.
- Filter by star rating to quickly revisit favorites or avoid past disappointments.
- Stats dashboard: total wines tried, average rating, wines loved (4+ stars).
- Cellar history feeds directly into the AI -- past ratings and notes inform future recommendations.

### Recommendation Engine (Edge Function)

- Scoring formula: 40% taste alignment, 25% food/occasion pairing, 20% quality/reputation, 15% value for money.
- Hard filters exclude wines over budget, wrong format, or on the avoidance list.
- Adventurousness calibration widens or narrows the recommendation window.
- Wine memory integration means the AI knows what you loved, what you hated, and what you have not tried yet.

---

## Phase 1.5: Truth & Detail (Completed)

### Reality-Grounded Analysis (Agentic Workflow)

- **Problem**: Large Language Models can "hallucinate" wine facts (e.g., inventing a tasting note for a specific vintage).
- **Solution**: A multi-step Agentic Workflow replaces the single-shot analysis:
    1. **Identify**: OCR extracts wine names from the image.
    2. **Research**: The system actively searches the web (via Tavily) for real-time technical sheets, critic reviews, and tasting notes for each identified wine.
    3. **Analyze**: The LLM uses this *verified* ground-truth data to generate recommendations, ensuring accuracy.

### Wine Details View

- **Structure Visualization**: Users can view the objective structure of any recommended wine (Body, Tannins, Acidity, Alcohol) visualized as progress bars.
- **Deep Dive**: Access full analysis, matching reasoning, and tasting notes from both the active Scanner view and the Scan History.

---

## Phase 2: Access Control (Completed)

### User Approval System

- New signups default to unapproved status and see a waiting screen.
- Admins receive a dedicated management page with pending/approved/all user filters.
- One-click approve or revoke access for any user.
- Role management: promote users to admin or demote back to standard.
- Existing users at time of deployment were auto-promoted to admin.
- Database trigger automatically creates a profile row on every new signup.

### Why This Matters

- Each scan consumes OpenAI API tokens. Uncontrolled signups would create unpredictable costs.
- Keeps the platform invite-only during early testing, ensuring quality feedback.
- Admins maintain full visibility into who is using the system and can cut access instantly.

---

## Phase 3: Discovery and History (Planned)

### Scan History Enhancements

- Search and filter past scans by date, context, wine name, or rating.
- "Revisit" button to re-run a past scan with updated preferences.
- Export scan history as CSV or PDF for personal records.

### Smarter Recommendations

- Track which recommendations users actually chose and how they rated them -- close the feedback loop.
- "Why not this wine?" explanations for wines that were detected but not recommended.
- Seasonal and trending wine suggestions based on aggregated (anonymized) community data.

### Wine Knowledge

- Tap any wine type, region, or grape in the app to see a brief educational card.
- "Learn more" links to deepen understanding of why a wine was recommended.

---

## Phase 4: Social and Community (Planned)

### Wine Circles

- Create private groups (friends, wine club, dinner party guests).
- Share your taste profile summary with a circle so others understand your palate.
- Group scan: one person photographs the list, everyone in the circle gets personalized picks from the same list simultaneously.

### Shared Cellar

- Collaborative wine log for couples, households, or clubs.
- See what circle members rated highly and discover wines through trusted palates.
- "Recommended by [friend]" badge on wines that someone in your circle loved.

### Social Discovery

- Follow other users (opt-in) to see their top-rated wines in a feed.
- "Taste match" score between users -- find people with similar palates.
- Community-curated lists: "Best wines under $20", "Date night picks", "Summer patio wines".

### Events and Tastings

- Create a tasting event, invite circle members.
- During the event, everyone rates the same wines -- see live group scores.
- Post-event summary comparing palates and highlighting consensus favorites.

---

## Phase 5: Platform and Integrations (Future)

### Restaurant Partnerships

- Restaurants opt-in to have their wine list pre-loaded in Somm.
- QR code at the table opens the wine list directly in the app -- no photo needed.
- Restaurants see anonymized, aggregated data on what styles their patrons prefer.

### Wine Retailer Integration

- "Buy this wine" links to partner retailers with inventory and pricing.
- Price comparison across local shops and online retailers.
- Delivery integration for one-tap purchasing.

### Cellar Management

- Track physical inventory: bottles owned, storage location, drink-by dates.
- "Open next" suggestions based on what is in your cellar, upcoming meals, and aging windows.
- Notifications when a cellar wine hits its ideal drinking window.

### API and Platform

- Public API for third-party wine apps to use Somm's recommendation engine.
- Webhook support for integrations (e.g., notify a Slack channel when a new scan scores 90+).
- White-label option for restaurants and retailers to embed Somm in their own apps.

---

## Technical Architecture

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router v7 |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) with Row Level Security |
| AI | OpenAI GPT-4o Vision via Supabase Edge Function |
| Search Agent | Tavily API (for reality-grounding) |
| Image Processing | Browser Canvas API (client-side compression) |
| State | React Context (AuthContext) |

### Database Tables

| Table | Purpose |
|-------|---------|
| `user_preferences` | Taste profile, budgets, adventurousness |
| `scan_sessions` | Scan history with detected wines and recommendations |
| `wine_memories` | Personal wine cellar with ratings and notes |
| `user_profiles` | Admin approval status and role management |

### Security Model

- Row Level Security on every table -- users can only access their own data.
- Admin role checked via `user_profiles` for elevated access.
- OpenAI API keys stored in browser localStorage only, never persisted server-side.
- Edge function proxies all AI calls, keeping the client isolated from external APIs.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Recommendation acceptance rate | >60% of scans result in a saved wine |
| Return usage | >3 scans per user per month |
| Cellar growth | >5 wines logged per active user per month |
| Rating accuracy | Average match score of chosen wines trends upward over time |
| Approval turnaround | <24 hours from signup to admin approval |

---

## Constraints

- **Cost**: Each scan uses GPT-4 Vision tokens. Admin approval system exists specifically to gate this spend.
- **Image quality**: OCR accuracy depends on photo clarity. Blurry or low-light images may produce incomplete wine detection.
- **API key model**: Currently users provide their own OpenAI key. A pooled key model may be needed for broader adoption.
- **Offline**: The app requires internet for scanning and recommendations. Cellar browsing could work offline in a future PWA version.
