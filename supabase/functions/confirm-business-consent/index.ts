// supabase/functions/confirm-business-consent/index.ts
//
// The link in the verification email points here. Confirms consent,
// logs the IP + timestamp as proof, flips the listing live, and sends
// the "you're confirmed" follow-up email.
//
// Deploy: supabase functions deploy confirm-business-consent
// Same secrets as request-business-consent (RESEND_API_KEY, SITE_URL,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from "@supabase/supabase-js";

function htmlPage(title: string, message: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 60px auto; text-align: center;">
  <h1>${title}</h1>
  <p>${message}</p>
  <p><a href="${Deno.env.get("SITE_URL") ?? "https://european-living.live"}">Return to European Living</a></p>
</body>
</html>`;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(htmlPage("Missing link", "This confirmation link is incomplete."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: business, error: findError } = await supabase
    .from("businesses")
    .select("id, name, submitted_by_email, submitted_by_name, consent_status")
    .eq("consent_token", token)
    .single();

  if (findError || !business) {
    return new Response(
      htmlPage("Link not found", "This confirmation link is invalid or has already been used."),
      { status: 404, headers: { "Content-Type": "text/html" } },
    );
  }

  if (business.consent_status === "confirmed") {
    return new Response(
      htmlPage("Already confirmed", "This listing has already been confirmed. No action needed."),
      { headers: { "Content-Type": "text/html" } },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("businesses")
    .update({
      consent_status: "confirmed",
      consent_confirmed_at: now,
      confirmation_ip: ip,
      is_visible: true,
      status: "active", // existing frontend queries filter on this — keep it in sync
      confirmation_email_sent_at: now,
    })
    .eq("id", business.id);

  if (updateError) {
    console.error(updateError);
    return new Response(htmlPage("Something went wrong", "Please try again or contact us."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  await supabase.from("business_consent_log").insert({
    business_id: business.id,
    event_type: "confirmed",
    email: business.submitted_by_email,
    ip_address: ip,
    token,
  });

  // Fire-and-forget confirmation email — don't block the success page on it.
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "European Living <verify@mail.european-living.live>",
      to: business.submitted_by_email,
      subject: "Your European Living listing is confirmed",
      html: `
        <p>Hi ${business.submitted_by_name},</p>
        <p>This confirms you verified your submission of <strong>${business.name}</strong> and
        have granted European Living the right to publish this listing on the
        English-Speaking Services Directory.</p>
        <p>You can ask us to remove it at any time by contacting
        privacy@european-living.live — we'll take it down, and you can ask to have it
        restored later without resubmitting.</p>
        <p>Best,<br/>Terrell C Lombardi<br/>European Living<br/>Untere Burggasse 4, 71063 Sindelfingen, Germany</p>
      `,
    }),
  }).catch((err) => console.error("Confirmation email failed:", err));

  return new Response(
    htmlPage(
      "You're confirmed!",
      `${business.name} is now live on European Living's Services Directory. A confirmation email is on its way to you for your records.`,
    ),
    { headers: { "Content-Type": "text/html" } },
  );
});