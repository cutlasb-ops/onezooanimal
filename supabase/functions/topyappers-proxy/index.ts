import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TOPYAPPERS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const hashtags = url.searchParams.get("hashtags") || "basketball,sports";
    const sortBy = url.searchParams.get("sortBy") || "views";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const page = url.searchParams.get("page") || "1";
    const perPage = url.searchParams.get("perPage") || "50";

    const params = new URLSearchParams({ hashtags, sortBy, sortOrder, page, perPage });
    const apiUrl = `https://www.topyappers.com/api/v1/videos?${params}`;

    const res = await fetch(apiUrl, {
      headers: { "x-ty-api-key": apiKey },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
