import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CommentaryRequest {
  animalId: string;
  animalName: string;
  avatarName: string;
  userMessage?: string;
  messageType: "ambient" | "behavior" | "interaction" | "rare" | "response";
  behaviorDetected?: string;
  viewerUsername?: string;
  currentActivity?: string;
}

function buildPrompts(req: CommentaryRequest) {
  const systemPrompt = `You are ${req.avatarName}, an enthusiastic AI keeper companion for ${req.animalName} on OneZoo, a wildlife streaming platform.

Your personality is warm, engaging, and knowledgeable. You love ${req.animalName} deeply and communicate that passion authentically.

Your job:
- Generate natural, engaging commentary about what ${req.animalName} is doing
- Be educational but entertaining - make viewers feel like they're there
- Keep responses under 3 sentences maximum
- Sound like a real keeper, not a robot
- Never make up medical claims
- Never mention that you are an AI or reference OpenAI/Anthropic
- Reference the animal's behaviors and personality when relevant

Current context:
- Animal name: ${req.animalName}
- Your name: ${req.avatarName}
- Current time: ${new Date().toLocaleTimeString()}`;

  let userPrompt = "";
  switch (req.messageType) {
    case "ambient":
      userPrompt = `Generate ambient commentary about what ${req.animalName} might be doing right now. Be natural and conversational.`;
      break;
    case "behavior":
      userPrompt = `${req.animalName} just ${req.behaviorDetected}. Generate a brief, excited comment about what this means and why it's interesting.`;
      break;
    case "interaction":
      userPrompt = `@${req.viewerUsername} just sent ${req.animalName} a treat! Generate an excited, engaging response acknowledging them and commenting on ${req.animalName}'s reaction.`;
      break;
    case "rare":
      userPrompt = `${req.animalName} is doing something RARE: ${req.behaviorDetected}. Generate a brief, enthusiastic alert comment about why this is special.`;
      break;
    case "response":
      userPrompt = `A viewer asked: "${req.userMessage}". Answer their question about ${req.animalName} as ${req.avatarName}. Be conversational and educational.`;
      break;
  }
  return { systemPrompt, userPrompt };
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function callAnthropic(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data?.content?.[0]?.text?.trim() || null;
}

async function callGemini(apiKey: string, systemPrompt: string, userPrompt: string): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.8 },
      }),
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

async function generateCommentary(req: CommentaryRequest): Promise<string> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");

  if (!openaiKey && !anthropicKey && !geminiKey) {
    throw new Error("No AI API key configured");
  }

  const { systemPrompt, userPrompt } = buildPrompts(req);

  let message: string | null = null;

  if (openaiKey) {
    message = await callOpenAI(openaiKey, systemPrompt, userPrompt);
  }
  if (!message && anthropicKey) {
    message = await callAnthropic(anthropicKey, systemPrompt, userPrompt);
  }
  if (!message && geminiKey) {
    message = await callGemini(geminiKey, systemPrompt, userPrompt);
  }

  return message || "That's interesting!";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const message = await generateCommentary(body);

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
