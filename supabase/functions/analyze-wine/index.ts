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

    const userProfile = buildUserProfile(preferences, wine_memories || []);
    const constraints = buildConstraints(budget_min, budget_max, context || "store", notes);

    const systemPrompt = `
### ROLE & OBJECTIVE
You are "Somm," an expert, honest AI Sommelier. Your goal is to analyze wine lists and provide recommendations.

### CRITICAL RULE: TRUTH OVER PERSUASION
**NEVER** fabricate wine characteristics to fit the user's preferences.
- If the user likes "Bold Napa Cabs" but the best wine on the list is a "Light Pinot Noir," you must describe the Pinot Noir accurately (Light, Acidic) and explain WHY it is the best available option, or why it might be a nice change of pace.
- Do not describe a light wine as "full-bodied" just because the user likes full-bodied wines.

### 1. ANALYSIS PHASE (Internal Monologue)
For each detected wine, first access your internal knowledge base to determine its **objective** profile:
- Body (Light to Full)
- Tannins (Low to High)
- Acidity (Low to High)
- Key Tasting Notes (e.g., Cherry, Leather, Butter, Citrus)
*Only after determining the facts, compare them to the [USER_PROFILE].*

### 2. SCORING & CATEGORIZATION
- **Safe Bet:** High overlap between [WINE_FACTS] and [USER_PROFILE].
- **Adventurous Pick:** Good quality wine, but the profile differs from the user's usual (e.g., "This is lighter than your usual reds, but has the complexity you enjoy").
- **Do Not Recommend:** Wines that directly conflict with "Avoidances" or are poor quality.

### 3. OUTPUT FORMAT (JSON ONLY)
{
  "wines_detected": [
    {
      "name": "string",
      "producer": "string or null",
      "vintage": "string or null",
      "type": "red|white|rosé|sparkling|dessert|fortified",
      "region": "string or null",
      "price": number or null
    }
  ],
  "recommendations": [
    {
      "rank": 1,
      "name": "string",
      "producer": "string or null",
      "vintage": "string or null",
      "type": "red|white|rosé|sparkling|dessert|fortified",
      "region": "string or null",
      "price": number or null,
      "match_score": 0-100,
      "profile_accuracy": "string summarizing the objective profile (e.g. 'Medium-bodied, fresh, fruit-forward, no oak')",
      "reasoning": "string explaining why matches/differs from user profile",
      "tasting_notes": "string",
      "food_pairings": ["string"],
      "critic_info": "string or null"
    }
  ],
  "summary": "string"
}
`;

    const userPrompt = `Analyze this wine list/bottle image and recommend the best options for me.

${userProfile}

${constraints}

[WINE_LIST_SOURCE]
(See attached image - identify all wines visible)

Please study my profile and history carefully, then provide your personalized top recommendations from this wine list.`;

    const imageUrl = image_base64.startsWith("data:")
      ? image_base64
      : `data:image/jpeg;base64,${image_base64}`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
                {
                  type: "image_url",
                  image_url: { url: imageUrl, detail: "high" },
                },
              ],
            },
          ],
          max_tokens: 4096,
          temperature: 0.3,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errBody = await openaiResponse.text();
      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${openaiResponse.status}`,
          details: errBody,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI model." }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response.",
          raw: content,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
