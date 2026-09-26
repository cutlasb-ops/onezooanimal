import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface VoiceRow {
  voice: string;
  gender_label: string;
  persona_notes: string;
}

async function getAnimalVoice(animalName: string): Promise<VoiceRow | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/animal_voices?animal_name=ilike.${encodeURIComponent(animalName)}&select=voice,gender_label,persona_notes&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0] || null;
  } catch {
    return null;
  }
}

async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(apiKey: string, systemPrompt: string, userMessage: string): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nThe child says: "${userMessage}"` }],
          },
        ],
        generationConfig: { maxOutputTokens: 150, temperature: 0.9 },
      }),
    }
  );
  if (response.status === 429) return "__RATE_LIMITED__";
  if (!response.ok) return null;
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function synthesizeVoice(
  apiKey: string,
  text: string,
  voice: string
): Promise<string | null> {
  try {
    const cleanText = text.replace(/\*[^*]+\*/g, "").trim();
    if (!cleanText) return null;

    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: cleanText,
        format: "wav",
      }),
    });
    if (!res.ok) return null;

    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < buf.length; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(buf.subarray(i, i + chunkSize))
      );
    }
    return btoa(binary);
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey =
      Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");

    if (!openaiKey && !geminiKey) {
      return jsonResponse({ error: "No AI API key configured" }, 500);
    }

    const { userMessage, animalName, animalContext } = await req.json();

    if (!userMessage || !animalName) {
      return jsonResponse({ error: "Missing userMessage or animalName" }, 400);
    }

    const voiceRow = await getAnimalVoice(animalName);
    const voice = voiceRow?.voice || "alloy";
    const genderLabel = voiceRow?.gender_label || "";
    const personaNotes = voiceRow?.persona_notes || "";

    const systemPrompt = `You are ${animalName}, a real animal at the OneZoo wildlife streaming network. A child is talking to you through a microphone near your enclosure. Respond AS the animal in first person.

Rules:
- Speak in a fun, friendly, age-appropriate way that a child aged 5-12 would enjoy
- Use simple vocabulary and short sentences
- Share real facts about your species woven naturally into conversation
- Express emotions and personality (playful, curious, sleepy, hungry, etc)
- Keep responses to 2-3 sentences maximum
- If the child asks what you eat, where you live, etc., give real accurate answers
- Never break character — you ARE the animal
- Never mention that you are an AI or mention OpenAI/Gemini/Anthropic
- Add occasional sound effects in asterisks like *roar* or *splash* or *chirp*
${genderLabel ? `\nVoice identity: ${genderLabel}` : ""}
${personaNotes ? `\nExtra persona notes: ${personaNotes}` : ""}
${animalContext ? `\nAdditional context about this animal: ${animalContext}` : ""}`;

    let reply: string | null = null;

    if (openaiKey) {
      reply = await callOpenAI(openaiKey, systemPrompt, userMessage);
    }

    if (!reply && geminiKey) {
      const geminiResult = await callGemini(geminiKey, systemPrompt, userMessage);
      if (geminiResult === "__RATE_LIMITED__") {
        return jsonResponse({
          reply: `*yawn* I'm a little sleepy right now... can you try talking to me again in a moment?`,
          error: "rate_limited",
        });
      }
      reply = geminiResult;
    }

    const finalReply =
      reply || `*tilts head* Hmm, I didn't quite catch that! Can you say it again?`;

    let audioBase64: string | null = null;
    if (openaiKey) {
      audioBase64 = await synthesizeVoice(openaiKey, finalReply, voice);
    }

    return jsonResponse({
      reply: finalReply,
      audioBase64,
      voice,
      genderLabel,
      success: !!reply,
    });
  } catch (err) {
    return jsonResponse(
      {
        reply: `*looks around confused* Oops, something went wrong! Try again?`,
        error: String(err),
      },
      500
    );
  }
});
