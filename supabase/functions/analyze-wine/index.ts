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
  };
  wine_memories: WineMemory[];
  budget_min: number;
  budget_max: number;
  context: "store" | "restaurant";
  notes: string;
  openai_api_key?: string;
}

function buildUserProfile(
  prefs: AnalyzeRequest["preferences"],
  memories: WineMemory[]
): string {
  const lines: string[] = ["[USER_PROFILE]"];

  const loved = memories.filter((m) => m.rating >= 4);
  const disliked = memories.filter((m) => m.rating <= 2);

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

function buildConstraints(budget_min: number, budget_max: number, context: string, notes: string): string {
  const lines: string[] = ["[CURRENT_CONSTRAINTS]"];

  const setting = context === "restaurant" ? "Restaurant / Wine Bar" : "Store / Wine Shop";
  lines.push(`* **Setting:** ${setting}`);

  if (budget_min > 0 || budget_max > 0) {
    const priceNote = context === "restaurant"
      ? " (restaurant pricing — expect markup over retail)"
      : " (retail pricing)";
    lines.push(`* **Budget:** $${budget_min} - $${budget_max} USD${priceNote}`);
  } else {
    lines.push("* **Budget:** No specific budget");
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
    } = body;

    // Determine which API key to use
    let apiKey = body.openai_api_key;
    const authHeader = req.headers.get('Authorization');

    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: user } = await supabaseClient.auth.getUser();
      if (user?.user) {
        const { data: profile } = await supabaseClient
          .from('user_profiles')
          .select('use_shared_key')
          .eq('user_id', user.user.id)
          .single();

        if (profile?.use_shared_key) {
          apiKey = Deno.env.get('OPENAI_API_KEY');
        }
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "No OpenAI API key configured. Please add your API key in Settings.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!image_base64) {
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
    // STEP 1: IDENTIFY WINES (OCR)
    // -------------------------------------------------------------------------
    const identificationPrompt = `
    Identify all wines in this image. Return ONLY a JSON object with this structure:
    {
      "wines": [
        { "name": "Producer + Name", "vintage": "Year" or null }
      ]
    }
    Ignore non-wine text. If no wines are found, return { "wines": [] }.
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
          {
            role: "user",
            content: [
              { type: "text", text: identificationPrompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!ocrResponse.ok) throw new Error("Failed to identify wines");
    const ocrData = await ocrResponse.json();
    const winesFound = JSON.parse(ocrData.choices[0].message.content).wines || [];

    // -------------------------------------------------------------------------
    // STEP 2: RESEARCH WINES (TAVILY AGENT)
    // -------------------------------------------------------------------------
    const tavilyKey = Deno.env.get("TAVILY_API_KEY");
    let researchContext = "";
    
    // Only search if we found wines and have a key
    if (winesFound.length > 0 && tavilyKey) {
       // Search for top 5 wines max to save time/tokens
       const winesToSearch = winesFound.slice(0, 5); 
       
       const searchPromises = winesToSearch.map(async (wine: any) => {
          const query = `${wine.name} ${wine.vintage || ""} wine tech sheet tasting notes`;
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
             return `WINE: ${wine.name} (${wine.vintage || "NV"})\nFACTS: ${content}\n\n`;
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
    const constraints = buildConstraints(budget_min, budget_max, context || "store", notes);
    
    // Original system prompt + new instructions
    const systemPrompt = `
### ROLE
You are "Somm," an expert AI Sommelier.

### OBJECTIVE
Analyze the wine list and user profile to provide personalized recommendations.
**CRITICAL:** You have been provided with VERIFIED EXTERNAL DATA about these wines.
Use this data to determine the body, tannins, acidity, and flavor profiles.
Do NOT guess. If the search data contradicts your internal knowledge, prefer the search data.

### 1. ANALYSIS
Compare verified wine facts against:
${userProfile}

### 2. OUTPUT FORMAT (JSON ONLY)
{
  "wines_detected": [
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
      "reasoning": "string explaining why matches/differs",
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
          temperature: 0.2, // Lower temperature for more factual adherence
        }),
    });

    if (!finalResponse.ok) {
       const err = await finalResponse.text();
       throw new Error(`Final analysis failed: ${err}`);
    }

    const finalData = await finalResponse.json();
    const content = finalData.choices[0].message.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
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
