import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  packId: string;
  packName: string;
  coins: number;
  price: number;
  origin?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { packId, packName, coins, price, origin }: CheckoutRequest = await req.json();
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured. Please add your Stripe secret key." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey || "",
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = await userResponse.json();
    const userId = user.id;
    const userEmail = user.email;

    const baseUrl = origin || "https://onezoo.com";

    const params = new URLSearchParams();
    params.append("payment_method_types[0]", "card");
    params.append("line_items[0][price_data][currency]", "usd");
    params.append("line_items[0][price_data][product_data][name]", `${packName} - ${coins} OneZoo Coins`);
    params.append("line_items[0][price_data][product_data][description]", `${coins} virtual coins for OneZoo interactive animal cams`);
    params.append("line_items[0][price_data][unit_amount]", Math.round(price * 100).toString());
    params.append("line_items[0][quantity]", "1");
    params.append("mode", "payment");
    params.append("success_url", `${baseUrl}?checkout=success&coins=${coins}`);
    params.append("cancel_url", `${baseUrl}?checkout=cancelled`);
    params.append("customer_email", userEmail);
    params.append("metadata[user_id]", userId);
    params.append("metadata[coins]", coins.toString());
    params.append("metadata[pack_id]", packId);

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${stripeSecretKey}:`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const responseBody = await stripeResponse.json();

    if (!stripeResponse.ok) {
      const errorMessage = responseBody?.error?.message || "Failed to create checkout session";
      console.error("Stripe API error:", JSON.stringify(responseBody));
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: stripeResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ sessionId: responseBody.id, url: responseBody.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
