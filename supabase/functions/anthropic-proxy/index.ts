import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | Array<{ type: string; text?: string }>;
}

function extractText(content: AnthropicMessage["content"]): string {
  if (typeof content === "string") return content;
  return content.map((c) => (c.type === "text" ? c.text || "" : "")).join("\n");
}

async function callOpenAIAsAnthropic(apiKey: string, body: {
  system?: string;
  messages?: AnthropicMessage[];
  max_tokens?: number;
  temperature?: number;
}) {
  const messages: Array<{ role: string; content: string }> = [];
  if (body.system) messages.push({ role: "system", content: body.system });
  for (const m of body.messages || []) {
    messages.push({ role: m.role, content: extractText(m.content) });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: body.max_tokens || 512,
      temperature: body.temperature ?? 0.7,
      messages,
    }),
  });

  if (!res.ok) {
    return { ok: false, status: res.status, data: await res.json().catch(() => ({})) };
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  return {
    ok: true,
    status: 200,
    data: {
      id: data.id,
      type: "message",
      role: "assistant",
      model: data.model,
      content: [{ type: "text", text }],
      stop_reason: data?.choices?.[0]?.finish_reason || "end_turn",
      usage: data.usage,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!anthropicKey && !openaiKey) {
      return new Response(JSON.stringify({ error: "No AI API key configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    if (openaiKey) {
      const openaiResult = await callOpenAIAsAnthropic(openaiKey, body);
      if (openaiResult.ok) {
        return new Response(JSON.stringify(openaiResult.data), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (anthropicKey) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("Anthropic error:", response.status, JSON.stringify(data));
      }
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "No provider succeeded" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
