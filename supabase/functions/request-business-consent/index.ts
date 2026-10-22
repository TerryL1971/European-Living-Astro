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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const confirmLink =
      `${supabaseUrl}/functions/v1/confirm-business-consent?token=${business.consent_token}`;

    const emailHtml = `
      <p>Hi ${submitted_by_name},</p>
      <p>We received a request to list <strong>${businessFields.name ?? "your business"}</strong>
      on European Living's English-Speaking Services Directory.</p>
      <p>To confirm you submitted this yourself and authorize us to publish it, please click below:</p>
      <p><a href="${confirmLink}">Confirm my business listing</a></p>
      <p>If you didn't request this, just ignore this email — nothing will be published.</p>
      <p>Questions? Reply to this email or contact privacy@european-living.live.</p>
      <p>Best,<br/>Terrell C Lombardi<br/>European Living<br/>Untere Burggasse 4, 71063 Sindelfingen, Germany</p>
    `;

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