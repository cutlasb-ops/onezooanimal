import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

async function callGeminiWithRetry(
  apiKey: string,
  contents: unknown,
  generationConfig?: unknown,
  retries = MAX_RETRIES
): Promise<{ data: Record<string, unknown>; status: number }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: generationConfig || {
            maxOutputTokens: 300,
            temperature: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    if (response.status === 429 && attempt < retries) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterMatch = data?.error?.details?.find(
        (d: { retryDelay?: string }) => d.retryDelay
      );
      let waitMs = BASE_DELAY_MS * Math.pow(2, attempt);

      if (retryAfterHeader) {
        waitMs = Math.max(waitMs, parseInt(retryAfterHeader, 10) * 1000);
      } else if (retryAfterMatch?.retryDelay) {
        const seconds = parseInt(retryAfterMatch.retryDelay, 10);
        if (!isNaN(seconds)) {
          waitMs = Math.max(waitMs, seconds * 1000);
        }
      }

      waitMs = Math.min(waitMs, 60000);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    return { data, status: response.status };
  }

  return {
    data: {
      error: {
        code: 429,
        message: "Rate limit exceeded after multiple retries. Please try again later.",
        status: "RESOURCE_EXHAUSTED",
      },
    },
    status: 429,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey =
      Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey && !openaiKey) {
      return jsonResponse({ error: "No AI API key configured" }, 500);
    }

    const url = new URL(req.url);
    const route = url.pathname.split("/").pop();

    const body = await req.json();

    if (route === "commentary") {
      return await handleCommentary(apiKey, body, openaiKey);
    }

    if (!apiKey) {
      return jsonResponse({ error: "Gemini API key required for this route" }, 500);
    }

    if (route === "transcribe") {
      return await handleTranscribe(apiKey, body);
    }

    const { contents, generationConfig } = body;
    const response = await callGeminiWithRetry(
      apiKey,
      contents,
      generationConfig
    );
    return jsonResponse(response.data, response.status);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});

async function callOpenAIVision(
  apiKey: string,
  prompt: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<string | null> {
  const userContent: unknown[] = [{ type: "text", text: prompt }];
  if (imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}` },
    });
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.9,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

async function handleCommentary(
  apiKey: string | undefined,
  body: {
    streamUrl?: string;
    context: string;
    prompt: string;
    imageBase64?: string;
    imageMimeType?: string;
  },
  openaiKey?: string
) {
  const { streamUrl, context, prompt, imageBase64, imageMimeType } = body;
  const visionActive = !!imageBase64;

  const finalPrompt = visionActive
    ? `You are a live wildlife sports commentator for OneZoo. You are watching a real livestream frame. Context: ${context}. Look at this image carefully. Describe exactly what you see — animal positions, movements, behaviors — and generate 2 sentences of punchy live commentary. Be specific about what is visible. Output commentary only.`
    : streamUrl
      ? `${prompt} The user has a live stream connected at: ${streamUrl}. Generate commentary as if watching live.`
      : prompt;

  let text: string | null = null;

  if (openaiKey) {
    text = await callOpenAIVision(openaiKey, finalPrompt, imageBase64, imageMimeType);
  }

  if (!text && apiKey) {
    const parts: unknown[] = [];
    if (imageBase64) {
      parts.push({
        inline_data: {
          mime_type: imageMimeType || "image/jpeg",
          data: imageBase64,
        },
      });
    }
    parts.push({ text: finalPrompt });

    const result = await callGeminiWithRetry(apiKey, [{ parts }], {
      maxOutputTokens: 200,
      temperature: 0.9,
    });
    text =
      result.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  }

  return jsonResponse({
    commentary: text,
    visionActive,
    streamConnected: !!streamUrl,
    success: !!text,
  });
}

async function handleTranscribe(
  apiKey: string,
  body: { context: string; streamUrl?: string }
) {
  const { context, streamUrl } = body;

  if (!streamUrl) {
    return jsonResponse({
      transcript: null,
      error: "Stream URL required for transcription. Please provide a valid stream URL.",
      success: false,
    });
  }

  try {
    const audioData = await fetchAudioSegment(streamUrl);
    if (!audioData) {
      return jsonResponse({
        transcript: null,
        error: "Unable to extract audio from stream. The stream may be offline or unreachable.",
        success: false,
      });
    }

    const parts = [
      {
        inline_data: {
          mime_type: "audio/mpeg",
          data: audioData,
        },
      },
      {
        text: `You are a wildlife audio transcription system for OneZoo. Context: ${context}. Transcribe the audio you hear in detail. Include any animal vocalizations, environmental sounds, and any human voices or announcements. Format with timestamps if possible. Be accurate to what you actually hear.`,
      },
    ];

    const result = await callGeminiWithRetry(
      apiKey,
      [{ parts }],
      {
        maxOutputTokens: 500,
        temperature: 0,
      }
    );

    const transcript =
      result.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

    return jsonResponse({
      transcript,
      success: !!transcript,
      audioProcessed: true,
    });
  } catch (error) {
    return jsonResponse({
      transcript: null,
      error: `Transcription failed: ${String(error)}`,
      success: false,
    });
  }
}

async function fetchAudioSegment(streamUrl: string): Promise<string | null> {
  try {
    const response = await fetch(streamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let base64 = "";
    for (let i = 0; i < uint8Array.length; i += 8192) {
      const chunk = uint8Array.slice(i, i + 8192);
      base64 += String.fromCharCode.apply(null, Array.from(chunk));
    }

    return btoa(base64);
  } catch {
    return null;
  }
}
