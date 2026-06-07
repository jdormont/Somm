# How Somm Uses Your Taste Profile

Somm's recommendation engine ("The Brain") uses a multi-layered approach to find the perfect wine for you. Your **Taste Preferences** are the most critical signal we send to the AI.

## 1. Spectrum Preferences (The "Hard" Signals)

When you adjust the sliders in your Preferences (Body, Sweetness, Tannins, Acidity, Earthiness), we send these exact ranges to the AI as **strict constraints**.

### How it works

* **Body (1-10):**
  * *1-4:* AI prioritizes **Light-bodied** wines (e.g., Pinot Noir, Gamay).
  * *5-7:* AI looks for **Medium-bodied** structure.
  * *8-10:* AI filters for **Full-bodied** powerhouses (e.g., Cab Sauv, Syrah).
* **Acidity (1-10):**
  * *High Preference (7+):* AI seeks wines described as "Crisp", "Zesty", or "Bright".
  * *Low Preference (<4):* AI avoids "Tart" wines, preferring "Soft" or "Round" profiles.
* **Earthiness (1-10):**
  * This determines if you prefer **Fruit-Forward** (Low) or **Savory/Old World** (High) styles.
  * *Example:* If you set Earthiness to 8-10, the AI will recommend a Chinon (Cab Franc) over a Napa Cab, even if both are red wines.

## 2. The "Calibration" Effect

When you add **Taste Anchors** (favorite wines), we calculate the *average* profile of those wines and automatically set your Spectrum sliders.

* *Example:* If you scan 3 big Napa Cabs, your "Body" slider will automatically move to 8-10 and "Tannins" to 7-9.
* The AI then uses these updated slider values for all future recommendations.

## 3. Hierarchy of Influence

When analyzing a wine list, the AI weighs factors in this order:

1. **Safety Filters:** Budget Max & Avoidances (e.g., "No Chardonnay").
2. **Spectrum Matches:** Does the wine fall within your Body/Acidity/Tannin ranges?
3. **Context:** Are you eating food? (Food pairing rules override minor preference mismatches).
4. **History:** Have you rated similar wines 5-stars before?
5. **Adventurousness:**
    * *Safe:* Stick strictly to the profile.
    * *Adventurous:* Suggest wines that *slightly* break the rules if they are exceptional quality.
