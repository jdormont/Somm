
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnchorAnalysisRequest {
  query?: string;
  image_base64?: string;
  openai_api_key?: string;
}

Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bodyText = await req.text();
    
    let body: AnchorAnalysisRequest;
    try {
        body = JSON.parse(bodyText);
    } catch (e) {
        console.error("[analyze-anchor-wine] JSON Parse Error", e);
        return new Response(
            JSON.stringify({ error: "Invalid JSON body" }), 
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const { query, image_base64 } = body;
    let apiKey = body.openai_api_key;
    const authHeader = req.headers.get('Authorization');
    
    // Get API Key (Shared or User provided)
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: user, error: userError } = await supabaseClient.auth.getUser();

      if (user?.user) {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: profileData } = await supabaseAdmin
          .from('user_profiles')
          .select('use_shared_key')
          .eq('user_id', user.user.id)
          .single();
        
        if (profileData?.use_shared_key) {
           apiKey = Deno.env.get('OPENAI_API_KEY');
        }
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No OpenAI API key found. Please check your settings or secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ... Rest of the logic

    // STEP 1: IDENTIFY WINE
    let searchTerm = query;
    let detectedWineName = query;

    if (image_base64) {
        const imageUrl = image_base64.startsWith("data:")
          ? image_base64
          : `data:image/jpeg;base64,${image_base64}`;

        const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Identify the wine in this image. Return just: Producer + Varietal + Vintage." },
                    { role: "user", content: [{ type: "image_url", image_url: { url: imageUrl } }] }
                ],
                max_tokens: 50
            })
        });

        if (visionResponse.ok) {
            const data = await visionResponse.json();
            searchTerm = data.choices[0].message.content.trim();
            detectedWineName = searchTerm;
        } else {
            const err = await visionResponse.text();
        }
    }

    // STEP 2: TAVILY SEARCH
    const tavilyKey = Deno.env.get("TAVILY_API_KEY");
    let searchContext = "";
    let sourceUrl = "";
    
    if (tavilyKey && searchTerm) {
        try {
            const resp = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    api_key: tavilyKey,
                    query: `${searchTerm} wine tech sheet tasting notes body tannin acidity`,
                    search_depth: "basic",
                    max_results: 3, 
                    include_domains: ["winemag.com", "vivino.com", "wine.com", "tech-sheets.com", "wineenthusiast.com"] 
                })
            });
            const data = await resp.json();
            if (data.results && data.results.length > 0) {
                 searchContext = data.results.map((r: any) => `[${r.title}] ${r.content}`).join("\n\n");
                 sourceUrl = data.results[0].url;
            } else {
            }
        } catch (e) {
            console.error("[analyze-anchor-wine] Tavily search failed", e);
        }
    }

    // STEP 3: LLM EXTRACTION
    
    // ... (Extraction Prompt Code) ...
    const extractionPrompt = `
    You are a factual data extractor. Return valid JSON only.
    Based STRICTLY on the search context below, map the wine's profile to a 1-10 scale.
    If data is missing, make an educated guess based on the varietal/region but flag it as estimated.
    
    Target Wine: ${searchTerm}

    Context:
    ${searchContext || "No search results. Use internal knowledge."}

    Output JSON Format:
    {
      "wine_name": "Full Wine Name",
      "producer": "Producer Name",
      "vintage": "Year or NV",
      "profile": {
        "body": 1-10 (1=Light, 10=Full),
        "tannin": 1-10 (1=Smooth, 10=Grippy),
        "acidity": 1-10 (1=Soft, 10=Crisp),
        "earthiness": 1-10 (1=Fruit Bomb, 10=Savory),
        "oak": 1-10 (1=Unoaked, 10=Heavy)
      },
      "confidence": "high|medium|low"
    }
    `;

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a precise data extractor." },
                { role: "user", content: extractionPrompt }
            ],
            response_format: { type: "json_object" }
        })
    });

    if (!completion.ok) {
        throw new Error("OpenAI Extraction failed");
    }

    const completionData = await completion.json();
    const result = JSON.parse(completionData.choices[0].message.content);

    return new Response(
        JSON.stringify({ ...result, source_url: sourceUrl, data_source: searchContext ? "tavily" : "internal" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
