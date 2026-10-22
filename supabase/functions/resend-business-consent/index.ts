// supabase/functions/resend-business-consent/index.ts
//
// Re-sends the "please confirm your listing" email for a business that's
// still consent_status = 'pending' — for the backlog of submissions whose
// original email (sent before the button-style template and the branded
// /confirm-business link existed) a business owner may have missed,
// ignored as suspicious-looking, or never seen. Reuses the business's
// EXISTING consent_token rather than generating a new one, so the link
// in the original email (if they still have it) keeps working too — this
// is a reminder, not a reset.
//
// Invoke manually (admin-only, not called from the public site):
//   curl -X POST https://<ref>.supabase.co/functions/v1/resend-business-consent \
//     -H "Authorization: Bearer <anon or service key>" \
//     -H "Content-Type: application/json" \
//     -d '{"business_id":"<uuid>"}'
//
// Deploy: supabase functions deploy resend-business-consent
// Same secrets as request-business-consent (RESEND_API_KEY, SITE_URL,
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).

import { createClient } from "@supabase/supabase-js";

// Kept in sync with request-business-consent's buildRequestEmailHtml —
// these are separate Deno deploys (no shared module), so if you change
// the button/copy in one, change it in the other too.
function buildRequestEmailHtml(submittedByName: string, businessName: string | undefined, confirmLink: string) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1F2937;">
      <p>Hi ${submittedByName},</p>
      <p>Just following up — we haven't heard back on your request to list
      <strong>${businessName ?? "your business"}</strong> on European Living's
      English-Speaking Services Directory.</p>
      <p>To confirm you submitted this yourself and authorize us to publish it, click the button below:</p>
      <p style="margin: 28px 0; text-align: center;">
        <a href="${confirmLink}"
           style="display: inline-block; background-color: #0284C7; color: #ffffff;
                  padding: 14px 32px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; font-size: 16px;">
          Confirm My Business Listing →
        </a>
      </p>
      <p style="font-size: 13px; color: #6b7280;">
        Button not working? Paste this link into your browser:<br/>
        <a href="${confirmLink}" style="color: #0284C7; word-break: break-all;">${confirmLink}</a>
      </p>
      <p>If you didn't request this, just ignore this email — nothing will be published.</p>
      <p>Questions? Reply to this email or contact privacy@european-living.live.</p>
      <p>Best,<br/>Terrell C Lombardi<br/>European Living<br/>Untere Burggasse 4, 71063 Sindelfingen, Germany</p>
    </div>
  `;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_id } = await req.json();

    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: business, error: findError } = await supabase
      .from("businesses")
      .select("id, name, submitted_by_name, submitted_by_email, consent_status, consent_token")
      .eq("id", business_id)
      .single();

    if (findError || !business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (business.consent_status !== "pending") {
      return new Response(
        JSON.stringify({ error: `consent_status is '${business.consent_status}', not 'pending' — nothing to resend` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!business.submitted_by_email || !business.submitted_by_name) {
      return new Response(
        JSON.stringify({ error: "Missing submitted_by_name/submitted_by_email on this row" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://european-living.live";
    const confirmLink = `${siteUrl}/confirm-business?token=${business.consent_token}`;
    const emailHtml = buildRequestEmailHtml(business.submitted_by_name, business.name, confirmLink);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "European Living <verify@mail.european-living.live>",
        to: business.submitted_by_email,
        subject: "Reminder: please confirm your business listing on European Living",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Could not send reminder email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // event_type is constrained to a fixed set in the DB (requested,
    // confirmed, revoked, restored, resubmitted) — 'resubmitted' is the
    // closest existing fit for "we sent the request email again."
    const { error: logError } = await supabase.from("business_consent_log").insert({
      business_id: business.id,
      event_type: "resubmitted",
      email: business.submitted_by_email,
      token: business.consent_token,
      note: "Reminder sent via resend-business-consent (admin-triggered).",
    });
    if (logError) {
      // Don't fail the response over a logging error — the email already
      // sent successfully — but do surface it, since the audit trail matters.
      console.error("Failed to log resend:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Reminder sent to ${business.submitted_by_email}.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
