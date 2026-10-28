// src/hooks/useSpeech.ts
//
// Plays phrase pronunciation. Prefers a real pre-generated MP3
// (audioUrl, from the phrases.audio_url column — see
// scripts/generate-phrase-audio.mjs) over speechSynthesis, because of a
// real iOS Safari/WebKit quirk: a real <audio>/<video> element plays
// through the "playback" audio session category, which ignores the
// device's physical ringer/silent switch (same as a YouTube video) —
// but window.speechSynthesis is routed through "ambient", which always
// respects the silent switch, and no web API can override that for a
// synthesized voice. A previous attempt at working around this with a
// silent-audio "unlock" trick (looping silence to keep the page's
// session in "playback" mode) did not hold up on real hardware, so
// speechSynthesis is now only ever a fallback — for any phrase whose
// audio hasn't been generated yet, and for browsers with no Audio
// support at all.
//
// Reuses phraseService's speechLangMap (not a separate hardcoded list)
// so the fallback can't silently drift out of sync with the actual 8
// languages this site supports.
import { useEffect, useRef, useState } from 'react';
import { speechLangMap } from '../services/phraseService';

export function useSpeech() {
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!speechSupported) return;
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [speechSupported]);

  // Don't leave anything playing (real audio or synthesized) after the
  // component using this hook unmounts.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, [speechSupported]);

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (speechSupported && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      window.speechSynthesis.cancel();
    }
  };

  // Fallback only — iOS mutes this when the silent switch is on.
  const speakSynth = (
    text: string,
    languageCode: string,
    languageName: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (!speechSupported) {
      setMessage(
        "Audio isn't available in this browser. If you opened this from Facebook or Instagram, tap ⋯ and choose “Open in browser”."
      );
      return;
    }
    const synth = window.speechSynthesis;
    const lang = speechLangMap[languageCode] ?? languageCode;
    const base = lang.split('-')[0].toLowerCase();
    if (!voicesRef.current.length) voicesRef.current = synth.getVoices();
    const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase();
    const voice =
      voicesRef.current.find((v) => norm(v) === lang.toLowerCase()) ??
      voicesRef.current.find((v) => norm(v).startsWith(base));
    if (voicesRef.current.length && !voice) {
      setMessage(`Your phone doesn't have a ${languageName} voice installed.`);
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    if (voice) u.voice = voice;
    u.rate = 0.85;
    u.onstart = () => onStart?.();
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    synth.speak(u);
    if (synth.paused) synth.resume();
  };

  const speak = (
    text: string,
    languageCode: string,
    languageName = 'this language',
    audioUrl?: string | null,
    // Optional "now playing" hooks — purely cosmetic (e.g. a pulsing
    // speaker button), not required for playback itself. Called for
    // both the real-MP3 and speechSynthesis-fallback paths so the UI
    // doesn't need to know which one actually played.
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    setMessage(null);
    stopAll();

    // Real MP3 = media playback, which plays with the silent switch on
    // (like YouTube) — always preferred when it exists.
    if (audioUrl) {
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = audioUrl;
      audio.onplay = () => onStart?.();
      audio.onended = () => onEnd?.();
      audio.onerror = () => {
        onEnd?.();
        speakSynth(text, languageCode, languageName, onStart, onEnd);
      };
      audio.play().catch(() => speakSynth(text, languageCode, languageName, onStart, onEnd));
      return;
    }

    speakSynth(text, languageCode, languageName, onStart, onEnd);
  };

  return { speak, message };
}
