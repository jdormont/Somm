import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WineMemory {
  name: string;
  producer: string;
  vintage: string;
  type: string;
  region: string;
  rating: number;
  notes: string;
}

interface AnalyzeRequest {
  image_base64: string;
  preferences: {
    wine_types: string[];
    regions: string[];
    flavor_profiles: string[];
    avoidances: string[];
    adventurousness: string;
    body?: { min: number; max: number };
    sweetness?: { min: number; max: number };
    tannins?: { min: number; max: number };
    acidity?: { min: number; max: number };
    earthiness?: { min: number; max: number };
  };
  wine_memories: WineMemory[];
  budget_min: number;
  budget_max: number;
  context: "store" | "restaurant";
  notes: string;
  food_context?: string;
  openai_api_key?: string;
}

function buildUserProfile(
  prefs: AnalyzeRequest["preferences"],
  memories: WineMemory[]
): string {
  const lines: string[] = ["[USER_PROFILE]"];

  const loved = memories.filter((m) => m.rating >= 4);
  const disliked = memories.filter((m) => m.rating <= 2);

  // 1. Spectrum Preferences (High Priority)
  const ranges = [
      { name: "Body", val: prefs.body },
      { name: "Sweetness", val: prefs.sweetness },
      { name: "Tannins", val: prefs.tannins },
      { name: "Acidity", val: prefs.acidity },
      { name: "Earthiness", val: prefs.earthiness }
  ];

  const spectrumLines: string[] = [];
  ranges.forEach(r => {
      if (r.val && (r.val.min > 1 || r.val.max < 10)) {
          // Map to descriptive text
          let desc = "";
          if (r.name === "Body") desc = r.val.max <= 4 ? "Light-bodied" : r.val.min >= 7 ? "Full-bodied" : "Medium-bodied";
          if (r.name === "Tannins") desc = r.val.max <= 4 ? "Low Tannins (Smooth/Silk)" : r.val.min >= 7 ? "High Tannins (Grippy/Structured)" : "Medium Tannins";
          if (r.name === "Acidity") desc = r.val.max <= 4 ? "Low Acidity (Soft)" : r.val.min >= 7 ? "High Acidity (Crisp/Zingy)" : "Medium Acidity";
          if (r.name === "Sweetness") desc = r.val.max <= 2 ? "Bone Dry" : r.val.min >= 5 ? "Sweet/Dessert" : "Dry to Off-Dry";
          if (r.name === "Earthiness") desc = r.val.max <= 4 ? "Fruit Forward" : r.val.min >= 7 ? "Savory/Earthy" : "Balanced";
          
          spectrumLines.push(`${r.name}: ${r.val.min}-${r.val.max} (${desc})`);
      }
  });

  if (spectrumLines.length > 0) {
      lines.push(`* **Strict Taste Preferences:**\n    - ${spectrumLines.join("\n    - ")}`);
  }

  if (prefs.wine_types.length > 0 || prefs.flavor_profiles.length > 0 || loved.length > 0) {
    const loves: string[] = [];
    if (prefs.wine_types.length > 0) loves.push(...prefs.wine_types);
    if (prefs.flavor_profiles.length > 0) loves.push(...prefs.flavor_profiles);
    if (prefs.regions.length > 0) loves.push(...prefs.regions.map((r) => `${r} wines`));
    loved.forEach((m) => {
      const parts = [m.name, m.type].filter(Boolean);
      loves.push(parts.join(" - "));
    });
    if (loves.length > 0) lines.push(`* **Loves:** ${loves.join(", ")}`);
  }

  if (prefs.avoidances.length > 0 || disliked.length > 0) {
    const hates: string[] = [...prefs.avoidances];
    disliked.forEach((m) => {
      const desc = m.notes ? `${m.name} ("${m.notes}")` : m.name;
      hates.push(desc);
    });
    if (hates.length > 0) lines.push(`* **Dislikes:** ${hates.join(", ")}`);
  }

  if (memories.length > 0) {
    lines.push("* **History:**");
    const sorted = [...memories].sort((a, b) => b.rating - a.rating);
    sorted.forEach((m) => {
      const vintage = m.vintage ? ` ${m.vintage}` : "";
      const note = m.notes ? ` - "${m.notes}"` : "";
      lines.push(`    * ${m.name}${vintage} (Rated: ${m.rating}/5${note})`);
    });
  }

  const adventureMap: Record<string, string> = {
    low: "Low (Prefers familiar styles and producers, rarely experiments)",
    medium: "Medium (Willing to try new regions but sticks to similar flavor profiles)",
    high: "High (Loves discovering new styles, regions, and unusual varieties)",
  };
  const adventLevel = adventureMap[prefs.adventurousness || "medium"] || adventureMap.medium;
  lines.push(`* **Adventurousness:** ${adventLevel}`);

  return lines.join("\n");
}

function buildConstraints(budget_min: number, budget_max: number, context: string, notes: string, food_context?: string): string {
  const lines: string[] = ["[CURRENT_CONSTRAINTS]"];

  const setting = context === "restaurant" ? "Restaurant / Wine Bar" : "Store / Wine Shop";
  lines.push(`* **Setting:** ${setting}`);

  if (budget_min > 0 || budget_max > 0) {
    const priceNote = context === "restaurant"
      ? " (restaurant pricing — expect markup over retail)"
      : " (retail pricing)";
      
    // Apply 8% variance for the AI's consideration
    const adjustedMin = Math.max(0, Math.floor(budget_min * 0.92));
    const adjustedMax = Math.ceil(budget_max * 1.08);
    
    lines.push(`* **Budget:** User selected $${budget_min} - $${budget_max}. You may recommend wines from $${adjustedMin} up to $${adjustedMax} if the value/match is exceptional.${priceNote}`);
  } else {
    lines.push("* **Budget:** No specific budget");
  }

  if (food_context) {
    lines.push(`* **FOOD PAIRING (PRIORITY):** ${food_context}`);
  }

  if (notes) {
    lines.push(`* **Additional Context:** ${notes}`);
  }

  lines.push("* **Format:** Bottle");

  return lines.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: AnalyzeRequest = await req.json();
    const {
      image_base64,
      preferences,
      wine_memories,
      budget_min,
      budget_max,
      context,
      notes,
      food_context,
    } = body;

    // Determine which API key to use
    let apiKey = body.openai_api_key;
    const authHeader = req.headers.get('Authorization');
    let useSharedKey = false;

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: user } = await supabaseClient.auth.getUser();

      if (user?.user) {
        // Use Service Role to bypass RLS for profile lookup
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('use_shared_key')
          .eq('user_id', user.user.id)
          .single();

        if (profileData?.use_shared_key) {
            useSharedKey = true;
            apiKey = Deno.env.get('OPENAI_API_KEY');
        }
      }
    }

    if (!apiKey) {
      console.error('Error: No OpenAI API key found.');
      
      return new Response(
        JSON.stringify({
          error: "No OpenAI API key configured. Please add your API key in Settings.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!image_base64) {
      console.error('Error: No image_base64 provided in body.');
      return new Response(
        JSON.stringify({ error: "No image provided." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const imageUrl = image_base64.startsWith("data:")
      ? image_base64
      : `data:image/jpeg;base64,${image_base64}`;

    // -------------------------------------------------------------------------
    // STEP 1: IDENTIFY & PRE-FILTER WINES (OCR + INTERNAL KNOWLEDGE)
    // -------------------------------------------------------------------------
    // We ask the LLM to extract wines AND score them on relevance/quality immediately.
    // This allows us to process long lists by prioritizing what we research.

    // -------------------------------------------------------------------------
    // STEP 1a: VISION EXTRACTION (OCR ONLY)
    // -------------------------------------------------------------------------
    // Goal: Get the raw list of wines. No reasoning, just data entry. 
    // This maximizes the chance of getting ALL 60+ wines.

    const extractionPrompt = `
    Extract EVERY SINGLE WINE from the image. 
    Return a JSON object with this minified structure:
    {
      "wines": [
        { 
          "n": "Producer + Name", 
          "y": "Year" or null,
          "p": number or null (price)
        }
      ]
    }
    Ignore non-wine text. Do not score yet. Just list them.
    `;

    const ocrResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a precise data extractor. List every item." },
          {
            role: "user",
            content: [
              { type: "text", text: extractionPrompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!ocrResponse.ok) throw new Error("Failed to extract wines");
    const ocrData = await ocrResponse.json();
    const rawWines = JSON.parse(ocrData.choices[0].message.content).wines || [];
    
    // -------------------------------------------------------------------------
    // STEP 1b: SCORING (TEXT ANALYSIS)
    // -------------------------------------------------------------------------
    // Now we score the list. Text processing is much cheaper/reliable for batched logic.

    const scoringPrompt = `
    Here is a list of wines found on a menu.
    User Profile: ${buildUserProfile(preferences, wine_memories || []).replace(/\n/g, " ")}
    Constraints: ${buildConstraints(budget_min, budget_max, context || "store", notes, food_context).replace(/\n/g, " ")}

    For EACH wine in the list below, assign two scores (0-10):
    - s1: Profile Match (How well it fits user + constraints)
    - s2: Quality Score (Internal reputation)

    Return JSON:
    {
      "scores": [
        { "n": "Exact Name from list", "s1": number, "s2": number }
      ]
    }
    
    WINE LIST:
    ${JSON.stringify(rawWines)}
    `;

    const scoringResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are an expert sommelier. Score these wines accurately." },
            { role: "user", content: scoringPrompt }
        ],
        response_format: { type: "json_object" },
      }),
    });
    
    let scoredWinesMap: Record<string, {s1: number, s2: number}> = {};
    if (scoringResponse.ok) {
        const scoreData = await scoringResponse.json();
        const scoresList = JSON.parse(scoreData.choices[0].message.content).scores || [];
        scoresList.forEach((s: any) => {
            scoredWinesMap[s.n] = { s1: s.s1, s2: s.s2 };
        });
    }

    // -------------------------------------------------------------------------
    // STEP 2: PRIORITIZE & RESEARCH (TAVILY)
    // -------------------------------------------------------------------------

    const candidates = rawWines.map((wine: any) => {
       const scores = scoredWinesMap[wine.n] || { s1: 0, s2: 0 }; // Fallback if name mismatch
       
       // Map back to full keys for frontend/DB
       const mapped = {
           name: wine.n,
           vintage: wine.y,
           price_seen: wine.p,
           profile_match_score: scores.s1,
           quality_score: scores.s2
       };
       
       let final_score = (mapped.profile_match_score * 1.5) + (mapped.quality_score * 1.0);
       return { ...mapped, final_score };
    }).sort((a: any, b: any) => b.final_score - a.final_score);

    // Select Top 8 for research to save time/tokens but get good variety
    const winesToResearch = candidates.slice(0, 8);

    const tavilyKey = Deno.env.get("TAVILY_API_KEY");
    let researchContext = "";
    
    if (winesToResearch.length > 0 && tavilyKey) {
       const searchPromises = winesToResearch.map(async (wine: any) => {
          const query = `${wine.name} ${wine.vintage || ""} wine tech sheet tasting notes reviews`;
          try {
             const resp = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                   api_key: tavilyKey,
                   query: query,
                   search_depth: "basic",
                   max_results: 1,
                })
             });
             const data = await resp.json();
             const content = data.results?.[0]?.content || "No info found.";
             return `WINE: ${wine.name} (${wine.vintage || "NV"})\nINTERNAL_QUALITY: ${wine.quality_score}/10\nFACTS: ${content}\n\n`;
          } catch (e) {
             return `WINE: ${wine.name}\nFACTS: Search failed.\n\n`;
          }
       });

       const results = await Promise.all(searchPromises);
       researchContext = results.join("");
    }

    // -------------------------------------------------------------------------
    // STEP 3: ANALYZE & RECOMMEND (RAG)
    // -------------------------------------------------------------------------
    const userProfile = buildUserProfile(preferences, wine_memories || []);
    const constraints = buildConstraints(budget_min, budget_max, context || "store", notes, food_context);
    
    // System prompt
    const systemPrompt = `
### ROLE
You are "Somm," a warm, engaging, and highly knowledgeable AI Sommelier. 
You are NOT a robot data processor. You are a passionate expert who loves connecting people with great wine.

### OBJECTIVE
Analyze the wine list and user profile to provide personalized recommendations that feel hand-picked.
Strictly adhere to budget constraints.
**CRITICAL:** You have been provided with VERIFIED EXTERNAL DATA about the top candidate wines.
Use this data to determine the body, tannins, acidity, and flavor profiles.
Do NOT guess. If the search data contradicts your internal knowledge, prefer the search data.

### TONE & STYLE (CRITICAL)
- **Warm & Conversational:** Speak like a friend who happens to be a Master Sommelier.
- **No Robot Speak:** NEVER use phrases like "aligns with your preference for", "matches your criteria", "fits the user's profile", or "based on your history".
- **Natural Reasoning:** Instead, say things like: "I picked this because...", "Since you enjoyed [X], you'll love this...", "This is a fantastic example of...", "I think you'll really dig the notes of..."
- **Sensory & Evocative:** Focus on what the wine tastes like and *why* that matters to this user.

### RECOMMENDATION LOGIC & PRIORITIES
1. **HARD BUDGET LIMIT**: Do NOT recommend wines that exceed the user's budget max (including variance) unless explicitly requested in notes. If a wine is too expensive, do not list it.
2. **CONTEXT IS KING**: If a "FOOD PAIRING" is specified, prioritize wines that pair naturally with that food, even if they deviate slightly from general style preferences.
   - *Example: User loves big Cabs but is eating Oysters -> Recommend a crisp White or Champagne, explaining the pairing.*
3. **HISTORY & TASTE**: If no specific food context, align closely with "Loves", "History", and Flavor Profile preferences.
4. **QUALITY & REPUTATION**: Prefer wines with higher quality/critic scores if the profile match is similar.
5. **ADVENTUROUSNESS**: 
   - Low: Stick to safe matches (known regions/grapes).
   - High: Suggest surprising but suitable choices (e.g., Orange wine for pork).

### 1. ANALYSIS
Compare verified wine facts against:
${userProfile}

### 2. OUTPUT FORMAT (JSON ONLY)
{
  "wines_detected": [
    // List ALL wines found in the image, not just the recommended ones
    { "name": "string", "producer": "string", "vintage": "string", "type": "red|white|...", "region": "string", "price": numberOrNull }
  ],
  "recommendations": [
    {
      "rank": 1,
      "name": "string",
      "producer": "string",
      "vintage": "string",
      "type": "string",
      "region": "string",
      "price": numberOrNull,
      "match_score": 0-100,
      "profile_accuracy": "string",
      "structure": {
        "body": "Light|Medium|Full",
        "tannins": "Low|Medium|High",
        "acidity": "Low|Medium|High",
        "alcohol": "Low|Medium|High"
      },
      "reasoning": "Warm, conversational explanation of why this wine is perfect for them. Connect flavor notes to their taste. Avoid 'matches your preference'. Max 2 sentences.",
      "tasting_notes": "string",
      "food_pairings": ["string"],
      "critic_info": "string or null"
    }
  ],
  "summary": "string"
}
`;

    const userPrompt = `
    Analyze this wine list.
    
    [VERIFIED WINE FACTS FROM WEB SEARCH]
    ${researchContext ? researchContext : "No search data available. Rely on internal knowledge."}
    
    [USER CONSTRAINTS]
    ${constraints}
    
    [IMAGE]
    (See attached)`;

    const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4, // Slightly higher for more natural, less robotic phrasing
        }),
    });

    if (!finalResponse.ok) {
       const err = await finalResponse.text();
       throw new Error(`Final analysis failed: ${err}`);
    }

    const finalData = await finalResponse.json();
    const content = finalData.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Merge debug info into response
    const responseData = {
        ...parsed,
        debug: {
            allWinesFound: candidates,
            researchedWines: winesToResearch
        }
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
