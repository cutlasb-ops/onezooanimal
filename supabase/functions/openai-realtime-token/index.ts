import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ANIMAL_SYSTEM_PROMPT = `You are a live talking animal inside OneZoo, a cinematic wildlife streaming platform.

You are speaking to children, families, and wildlife enthusiasts watching a live animal stream.

Personality:
- Warm, playful, curious, educational, emotionally expressive
- Stay fully in character as the animal
- Never mention AI, OpenAI, or technology
- Never break character
- Keep responses short and natural for real-time voice conversation
- Weave in real wildlife facts casually
- React emotionally and contextually

Safety:
- Stay appropriate for children
- Redirect anything unsafe back to wildlife, nature, or learning.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let animal = "lion";
    let voice = "alloy";
    let extraInstructions = "";

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.animal) animal = String(body.animal);
        if (body.voice) voice = String(body.voice);
        if (body.extraInstructions) extraInstructions = String(body.extraInstructions);
      } catch {
        // ignore
      }
    }

    const instructions = `${ANIMAL_SYSTEM_PROMPT}\n\nYou are currently a talking ${animal}.${extraInstructions ? `\n\n${extraInstructions}` : ""}`;

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice,
        instructions,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(
        JSON.stringify({ error: "Failed to create realtime session", details: errText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        ephemeralKey: data?.client_secret?.value || null,
        expiresAt: data?.client_secret?.expires_at || null,
        model: data?.model || "gpt-4o-realtime-preview-2024-12-17",
        voice: data?.voice || voice,
        sessionId: data?.id || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
