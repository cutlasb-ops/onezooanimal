import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    const crypto = globalThis.crypto;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(stripeWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const parts = signature.split(",");
    const timestamp = parts[0].split("=")[1];
    const signatures = parts[1].split("=")[1];

    const message = `${timestamp}.${body}`;
    const messageKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(stripeWebhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBuffer = new Uint8Array(
      signatures.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const messageBuffer = new TextEncoder().encode(message);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      messageKey,
      signatureBuffer,
      messageBuffer
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event = JSON.parse(body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const coins = parseInt(session.metadata?.coins || "0");
      const packId = session.metadata?.pack_id;

      if (!userId || !coins) {
        return new Response(
          JSON.stringify({ error: "Missing metadata" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      const supabase = createClient(supabaseUrl || "", supabaseServiceKey || "");

      await supabase.from("coin_transactions").insert({
        user_id: userId,
        amount: coins,
        transaction_type: "purchase",
        description: `Purchased ${coins} coins via Stripe`,
      });

      const { data: profile } = await supabase
        .from("profiles")
        .select("coin_balance")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ coin_balance: profile.coin_balance + coins })
          .eq("id", userId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
