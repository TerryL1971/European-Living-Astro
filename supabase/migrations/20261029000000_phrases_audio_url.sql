-- Real pronunciation audio for the travel phrases: speechSynthesis
-- alone is muted by iOS's silent switch (an "ambient" vs "playback"
-- audio session quirk in WebKit) — a real <audio>/<video> element
-- plays through "playback" and ignores the switch, same as a video
-- would. audio_url holds a public phrase-audio Storage URL generated
-- once via scripts/generate-phrase-audio.mjs; speechSynthesis stays
-- as the fallback for any phrase without one yet.
alter table public.phrases add column if not exists audio_url text;

-- Data API grants for this already-live table — see
-- 20261020000000_explicit_data_api_grants.sql for why these are
-- explicit now rather than relying on Supabase's pre-Oct-30 default.
grant select, insert, update, delete on public.phrases to anon;
grant select, insert, update, delete on public.phrases to authenticated;
grant select, insert, update, delete on public.phrases to service_role;
