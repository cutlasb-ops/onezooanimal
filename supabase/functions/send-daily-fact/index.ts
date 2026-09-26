import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "Gary the Zookeeper <gary@onezoo.com>";

const ANIMAL_EMOJIS: Record<string, string> = {
  marine: "&#128011;",
  mammals: "&#129409;",
  birds: "&#129413;",
  reptiles: "&#128013;",
  amphibians: "&#128056;",
  insects: "&#128028;",
  fish: "&#128032;",
  microscopic: "&#128300;",
  general: "&#127757;",
};

const GARY_QUIPS = [
  "I literally told three people this fact yesterday and they all said 'NO WAY.' Your turn.",
  "This one blew my mind when I first learned it. Had to sit down for a minute.",
  "I drop this fact at every dinner party. Works every time.",
  "Filed under: things they definitely should have taught us in school.",
  "I've been a zookeeper for years and I STILL think this is wild.",
  "Save this one for your next trivia night. You can thank me later.",
  "This is one of those facts that makes you go 'wait... really?' And yes. Really.",
  "I told this to one of our interns last week and they didn't believe me. Had to pull up the research paper.",
  "Nature is absolutely unhinged and I am here for it.",
  "If animals had resumes, this would definitely be on there.",
];

function buildFactHtml(
  fact: string,
  animalName: string,
  category: string,
  displayName: string
): string {
  const name = displayName || "friend";
  const emoji = ANIMAL_EMOJIS[category] || ANIMAL_EMOJIS.general;
  const quip = GARY_QUIPS[Math.floor(Math.random() * GARY_QUIPS.length)];

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
            <td style="background:linear-gradient(135deg,#065f46 0%,#047857 50%,#059669 100%);padding:32px 40px;text-align:center;">
              <p style="color:#a7f3d0;font-size:12px;margin:0 0 8px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">Gary's Daily Animal Fact</p>
              <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">
                ${emoji} Today's Creature: ${animalName}
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <p style="color:#44403c;font-size:16px;line-height:1.6;margin:0;">
                Good morning, ${name}! &#9749;
              </p>
            </td>
          </tr>

          <!-- The Fact -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border-radius:12px;padding:28px;border:1px solid #bbf7d0;">
                <p style="color:#065f46;font-size:18px;line-height:1.7;margin:0;font-weight:500;">
                  ${fact}
                </p>
              </div>
            </td>
          </tr>

          <!-- Gary's Commentary -->
          <tr>
            <td style="padding:0 40px 28px;">
              <p style="color:#78716c;font-size:15px;line-height:1.6;margin:0;font-style:italic;">
                "${quip}"
              </p>
              <p style="color:#92400e;font-size:14px;margin:8px 0 0;font-weight:600;">
                -- Gary &#128062;
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="https://onezoo.com" style="display:inline-block;background:linear-gradient(135deg,#047857,#059669);color:#ffffff;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;text-decoration:none;">
                Watch ${animalName}s Live &#8594;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#faf7f2;padding:20px 40px;text-align:center;border-top:1px solid #e7e5e4;">
              <p style="color:#a8a29e;font-size:12px;margin:0 0 8px;">
                OneZoo -- Your daily dose of wildlife wonder
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
              <p style="color:#d4d4d4;font-size:11px;margin:12px 0 0;">
                You're getting this because you're part of the OneZoo family.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function supabaseFetch(path: string, options?: RequestInit) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
      Prefer: options?.method === "PATCH" ? "return=minimal" : "return=representation",
      ...(options?.headers || {}),
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const factRes = await supabaseFetch(
      "animal_facts?order=last_sent_at.asc.nullsfirst,send_count.asc&limit=1"
    );
    const facts = await factRes.json();

    if (!facts || facts.length === 0) {
      throw new Error("No animal facts available");
    }

    const todaysFact = facts[0];

    const usersRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        },
      }
    );

    const usersData = await usersRes.json();
    const users = usersData.users || [];

    if (users.length === 0) {
      return new Response(
        JSON.stringify({ message: "No users to send to" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profilesRes = await supabaseFetch(
      "profiles?select=id,display_name"
    );
    const profiles = await profilesRes.json();
    const profileMap = new Map(
      (profiles || []).map((p: { id: string; display_name: string }) => [
        p.id,
        p.display_name,
      ])
    );

    let successCount = 0;
    let errorCount = 0;

    const BATCH_SIZE = 50;
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      const promises = batch.map(
        async (user: {
          id: string;
          email?: string;
          user_metadata?: { display_name?: string; full_name?: string };
        }) => {
          if (!user.email) return;

          const displayName =
            (profileMap.get(user.id) as string) ||
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            "";

          const html = buildFactHtml(
            todaysFact.fact,
            todaysFact.animal_name,
            todaysFact.category,
            displayName
          );

          try {
            const res = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: FROM_EMAIL,
                to: [user.email],
                subject: `Did you know this about ${todaysFact.animal_name}s? 🤯`,
                html,
              }),
            });

            if (res.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        }
      );

      await Promise.all(promises);
    }

    await supabaseFetch(
      `animal_facts?id=eq.${todaysFact.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          last_sent_at: new Date().toISOString(),
          send_count: todaysFact.send_count + 1,
        }),
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        fact: todaysFact.fact,
        animal: todaysFact.animal_name,
        emails_sent: successCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
