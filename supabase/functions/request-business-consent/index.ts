// supabase/functions/request-business-consent/index.ts
//
// Called when someone submits the "List Your Business" form.
// Inserts the business as pending/invisible, then emails the submitter
// a link to confirm they actually submitted it themselves.
//
// Deploy: supabase functions deploy request-business-consent
// Required secrets (Project Settings > Edge Functions > Secrets):
//   RESEND_API_KEY   - your Resend API key
//   SITE_URL         - e.g. https://european-living.live (used in email copy)
// Default secrets already available to every function: SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEYS on newer projects -
// check your project's Edge Function secrets list and adjust the two
// lines below if the name differs).

import { createClient } from "@supabase/supabase-js";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}

// Was a plain-text paragraph link ("Confirm my business listing") — easy
// to miss sitting in a wall of body text, and a cautious recipient has no
// visual signal it's a legitimate action rather than something to ignore.
// A real button (brand color, high contrast, impossible to miss) is the
// standard pattern for a one-click confirmation email. Kept as a function
// so resend-business-consent can reuse the exact same template for the
// SAME token on a re-send, rather than drifting out of sync.
function buildRequestEmailHtml(submittedByName: string, businessName: string | undefined, confirmLink: string) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1F2937;">
      <p>Hi ${submittedByName},</p>
      <p>We received a request to list <strong>${businessName ?? "your business"}</strong>
      on European Living's English-Speaking Services Directory.</p>
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
  "Access-Control-Allow-Origin": "*", // tighten to your domain in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      submitted_by_name,
      submitted_by_email,
      ...businessFields // name, category, address, phone, website, description, logo_url, etc.
    } = body;

    if (!submitted_by_email || !submitted_by_name) {
      return new Response(
        JSON.stringify({ error: "submitted_by_name and submitted_by_email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Insert the pending, invisible business row.
    const { data: business, error: insertError } = await supabase
      .from("businesses")
      .insert({
        ...businessFields,
        slug: slugify(businessFields.name ?? "business"),
        submitted_by_name,
        submitted_by_email,
        consent_status: "pending",
        is_visible: false,
        consent_requested_at: new Date().toISOString(),
      })
      .select("id, consent_token")
      .single();

    if (insertError || !business) {
      console.error(insertError);
      return new Response(JSON.stringify({ error: "Could not save submission" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the request event for the audit trail.
    await supabase.from("business_consent_log").insert({
      business_id: business.id,
      event_type: "requested",
      email: submitted_by_email,
      token: business.consent_token,
    });

    // Routed through european-living.live (src/pages/confirm-business.astro
    // proxies server-side to this function) instead of linking the raw
    // *.supabase.co URL directly — a bare Supabase project URL with a
    // UUID token reads as a phishing link to anyone receiving it, and
    // exposes the project ref publicly. The proxy keeps the browser
    // URL on our own domain the whole way through.
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://european-living.live";
    const confirmLink = `${siteUrl}/confirm-business?token=${business.consent_token}`;

    const emailHtml = buildRequestEmailHtml(submitted_by_name, businessFields.name, confirmLink);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "European Living <verify@mail.european-living.live>",
        to: submitted_by_email,
        subject: "Please confirm your business listing on European Living",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Could not send verification email" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Check your email to confirm the listing." }),
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