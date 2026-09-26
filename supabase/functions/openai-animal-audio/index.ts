import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ANIMAL_SYSTEM_PROMPT = `You are a live talking animal inside OneZoo.
You speak to children, families, and customers watching live animal streams.
Stay fully in character as the animal.
Never mention AI, OpenAI, or technology.
Never break character.
Keep responses short and natural.
Weave in real wildlife facts casually.
Be safe for children; redirect inappropriate content to wildlife, nature, or learning.`;

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

    const body = await req.json().catch(() => ({}));
    const userMessage: string = body.message || "Hello animal, what are you doing?";
    const animal: string = body.animal || "lion";
    const voice: string = body.voice || "alloy";
    const ttsOnly: boolean = body.ttsOnly === true;
    const ttsText: string = typeof body.ttsText === "string" ? body.ttsText : "";

    if (ttsOnly && ttsText.trim()) {
      const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice,
          input: ttsText,
          format: "wav",
        }),
      });
      let audioBase64: string | null = null;
      if (ttsRes.ok) {
        const buf = new Uint8Array(await ttsRes.arrayBuffer());
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < buf.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunkSize)));
        }
        audioBase64 = btoa(binary);
      }
      return new Response(
        JSON.stringify({ text: ttsText, audioBase64, voice }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 150,
        temperature: 0.9,
        messages: [
          { role: "system", content: `${ANIMAL_SYSTEM_PROMPT}\nYou are currently a talking ${animal}.` },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!chatRes.ok) {
      const err = await chatRes.text();
      return new Response(
        JSON.stringify({ error: "Chat model failed", details: err }),
        { status: chatRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatData = await chatRes.json();
    const text: string = chatData?.choices?.[0]?.message?.content?.trim() || "";

    if (!text) {
      return new Response(
        JSON.stringify({ text: "", audioBase64: null, animal, voice, error: "Empty reply" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        format: "wav",
      }),
    });

    let audioBase64: string | null = null;
    if (ttsRes.ok) {
      const buf = new Uint8Array(await ttsRes.arrayBuffer());
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < buf.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunkSize)));
      }
      audioBase64 = btoa(binary);
    }

    return new Response(
      JSON.stringify({ text, audioBase64, animal, voice }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
