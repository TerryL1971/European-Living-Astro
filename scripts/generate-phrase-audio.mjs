// scripts/generate-phrase-audio.mjs
//
// One-time (re-runnable) job: creates an MP3 for every row in `phrases`
// that doesn't have one yet, uploads it to the public "phrase-audio"
// Storage bucket, and saves the public URL back onto that row's
// audio_url column. See supabase/migrations/20261029000000_phrases_audio_url.sql
// for the column, and src/hooks/useSpeech.ts for why real audio files
// exist at all (iOS mutes speechSynthesis alone when the silent switch
// is on; a real <audio> element doesn't).
//
// Run from the project root (european-living-astro/):
//   SUPABASE_URL=https://pkacbcohrygpyapgtzpq.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   GOOGLE_TTS_API_KEY=... \
//   node scripts/generate-phrase-audio.mjs
//
// Keep the service-role key and the Google API key out of any committed
// file — pass them as env vars on the command line only, same as this
// repo's other one-off scripts (generate-sitemap.ts, before it was
// removed as dead code — same discipline applies here).
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_TTS_API_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_TTS_API_KEY) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and GOOGLE_TTS_API_KEY first.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'phrase-audio';

// Matches src/services/phraseService.ts's `languages` export exactly —
// 8 languages, Danish included, no Portuguese. If that list ever
// changes, update this one too (deliberately not imported from the .ts
// file here since this is a plain Node script, not part of the Astro
// build).
const LANG_MAP = {
  de: 'de-DE',
  fr: 'fr-FR',
  it: 'it-IT',
  es: 'es-ES',
  nl: 'nl-NL',
  cs: 'cs-CZ',
  da: 'da-DK',
  pl: 'pl-PL',
};

async function synthesize(text, languageCode) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  const { audioContent } = await res.json();
  return Buffer.from(audioContent, 'base64');
}

async function fetchRowsNeedingAudio() {
  // PostgREST caps a single select at 1000 rows (same limit
  // src/services/phraseService.ts's getAllPhrases() already works
  // around) — page through with .range() instead of one unbounded
  // select, or anything past the first 1000 silently never gets
  // picked up.
  const PAGE = 1000;
  let rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from('phrases')
      .select('id, translation, language_code')
      .is('audio_url', null)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows = rows.concat(page ?? []);
    if (!page || page.length < PAGE) break;
  }
  return rows;
}

async function main() {
  const rows = await fetchRowsNeedingAudio();

  console.log(`${rows.length} phrases need audio`);
  let done = 0,
    failed = 0;

  for (const row of rows) {
    const lang = LANG_MAP[row.language_code] ?? row.language_code;
    const path = `${row.language_code}/${row.id}.mp3`;
    try {
      const mp3 = await synthesize(row.translation, lang);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, mp3, { contentType: 'audio/mpeg', upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const { error: dbErr } = await supabase.from('phrases').update({ audio_url: pub.publicUrl }).eq('id', row.id);
      if (dbErr) throw dbErr;

      done++;
      if (done % 50 === 0) console.log(`  ${done}/${rows.length}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${row.language_code} "${row.translation}": ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 100)); // stay well under rate limits
  }

  console.log(`Finished: ${done} created, ${failed} failed`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
