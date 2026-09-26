import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Gary the Zookeeper <gary@onezoo.com>";

function buildWelcomeHtml(displayName: string): string {
  const name = displayName || "fellow animal lover";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#faf7f2;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf7f2;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%);padding:40px 40px 30px;text-align:center;">
              <div style="font-size:48px;margin-bottom:12px;">&#129409;</div>
              <h1 style="color:#ffffff;font-size:28px;margin:0 0 4px;font-weight:700;">Welcome to OneZoo!</h1>
              <p style="color:#fde68a;font-size:14px;margin:0;letter-spacing:0.5px;">Where Wildlife Comes Alive</p>
            </td>
          </tr>

          <!-- Gary's Message -->
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="color:#44403c;font-size:17px;line-height:1.7;margin:0 0 20px;">
                Hey ${name}! &#128075;
              </p>
              <p style="color:#44403c;font-size:16px;line-height:1.7;margin:0 0 20px;">
                I'm <strong>Gary the Zookeeper</strong> -- your personal guide to the wildest corner of the internet. I've been working with animals for over a decade, and honestly? I still get giddy every time I spot a new critter on our live feeds.
              </p>
              <p style="color:#44403c;font-size:16px;line-height:1.7;margin:0 0 20px;">
                You just joined a community of thousands of wildlife enthusiasts who tune in from all over the world. Whether you're here for the majestic elephants, the sneaky red pandas, or just to see what a capybara does all day (spoiler: vibes), you're in the right place.
              </p>
            </td>
          </tr>

          <!-- What's Waiting -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background-color:#fffbeb;border-radius:12px;padding:24px;border-left:4px solid #d97706;">
                <h3 style="color:#92400e;font-size:16px;margin:0 0 16px;font-weight:700;">Here's what's waiting for you:</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#57534e;font-size:15px;">
                      &#127909; <strong>24/7 Live Animal Feeds</strong> -- Watch wildlife in real-time from habitats around the globe
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#57534e;font-size:15px;">
                      &#128172; <strong>Live Chat</strong> -- Hang out with other animal lovers while you watch
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#57534e;font-size:15px;">
                      &#129513; <strong>Interactive Treats</strong> -- Toss virtual snacks and toys to the animals
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#57534e;font-size:15px;">
                      &#128218; <strong>Animal Encyclopedia</strong> -- Dive deep into species info and fun facts
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#57534e;font-size:15px;">
                      &#129302; <strong>Chat with Me (Gary!)</strong> -- Ask me anything about animals, I love a good question
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Daily Facts Teaser -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background-color:#f0fdf4;border-radius:12px;padding:24px;border-left:4px solid #16a34a;">
                <p style="color:#166534;font-size:15px;margin:0;line-height:1.6;">
                  <strong>&#128232; One more thing!</strong> Every morning at 8am, I'll send you a mind-blowing animal fact to start your day. Trust me, your coworkers will think you're a genius. (You're welcome.)
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="https://onezoo.com" style="display:inline-block;background:linear-gradient(135deg,#b45309,#d97706);color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;letter-spacing:0.3px;">
                Start Exploring &#8594;
              </a>
            </td>
          </tr>

          <!-- Gary's Sign-off -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="color:#57534e;font-size:15px;line-height:1.6;margin:0 0 16px;">
                See you out there in the wild,
              </p>
              <p style="color:#92400e;font-size:18px;font-weight:700;margin:0 0 4px;">
                &#128062; Gary the Zookeeper
              </p>
              <p style="color:#a8a29e;font-size:13px;margin:0;font-style:italic;">
                Head Zookeeper &amp; Chief Animal Enthusiast at OneZoo
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf7f2;padding:24px 40px;text-align:center;border-top:1px solid #e7e5e4;">
              <p style="color:#a8a29e;font-size:12px;margin:0 0 8px;">
                OneZoo -- Connecting people with wildlife through technology
              </p>
              <table align="center" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="https://www.instagram.com/onezoozookeeper/" style="color:#d97706;font-size:12px;text-decoration:none;">Instagram</a>
                  </td>
                  <td style="color:#d4d4d4;">|</td>
                  <td style="padding:0 8px;">
                    <a href="https://www.tiktok.com/@onezoozookeeper" style="color:#d97706;font-size:12px;text-decoration:none;">TikTok</a>
                  </td>
                  <td style="color:#d4d4d4;">|</td>
                  <td style="padding:0 8px;">
                    <a href="https://www.linkedin.com/company/onezooanimals/" style="color:#d97706;font-size:12px;text-decoration:none;">LinkedIn</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload = await req.json();

    let email: string | undefined;
    let displayName: string | undefined;

    if (payload.type === "INSERT" && payload.record) {
      const userId = payload.record.id;
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const userRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
          },
        }
      );

      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.email;
        displayName =
          userData.user_metadata?.display_name ||
          userData.user_metadata?.full_name ||
          "";
      }
    } else {
      email = payload.email;
      displayName = payload.display_name || payload.displayName || "";
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "No email found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = buildWelcomeHtml(displayName || "");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Welcome to the Zoo! Gary the Zookeeper here 🦁",
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
