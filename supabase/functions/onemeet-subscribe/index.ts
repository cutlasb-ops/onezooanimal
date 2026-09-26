import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SubscribeRequest {
  planId: string;
  planName: string;
  price: number;
  origin?: string;
  email?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { planId, planName, price, origin, email }: SubscribeRequest =
      await req.json();

    if (!planId || !planName || !price || price < 1) {
      return new Response(
        JSON.stringify({ error: "Invalid plan details." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const baseUrl = origin || "https://onezoo.com";

    const params = new URLSearchParams();
    params.append("payment_method_types[0]", "card");
    params.append(
      "line_items[0][price_data][currency]",
      "usd"
    );
    params.append(
      "line_items[0][price_data][product_data][name]",
      `OneMeet ${planName} Membership`
    );
    params.append(
      "line_items[0][price_data][product_data][description]",
      `Monthly ${planName} membership for OneMeet experiences and matching`
    );
    params.append(
      "line_items[0][price_data][unit_amount]",
      Math.round(price * 100).toString()
    );
    params.append(
      "line_items[0][price_data][recurring][interval]",
      "month"
    );
    params.append("line_items[0][quantity]", "1");
    params.append("mode", "subscription");
    params.append(
      "success_url",
      `${baseUrl}/OneMeet?subscription=success&plan=${planId}`
    );
    params.append("cancel_url", `${baseUrl}/OneMeet?subscription=cancelled`);
    params.append("metadata[plan_id]", planId);
    params.append("metadata[plan_name]", planName);
    params.append("metadata[source]", "onemeet");

    if (email) {
      params.append("customer_email", email);
    }

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${stripeSecretKey}:`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const responseBody = await stripeResponse.json();

    if (!stripeResponse.ok) {
      const errorMessage =
        responseBody?.error?.message || "Failed to create subscription session";
      console.error("Stripe API error:", JSON.stringify(responseBody));
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: stripeResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ url: responseBody.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
