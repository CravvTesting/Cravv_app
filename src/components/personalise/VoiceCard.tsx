"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { IMG } from "./index";

// Bar heights from the Figma "Voice" card (39 bars, 4px wide, 8.75px pitch).
const BARS = [8, 14, 22, 30, 18, 26, 36, 24, 14, 20, 32, 40, 28, 16, 10, 18, 26, 34, 22, 12, 8, 16, 24, 30, 20, 14, 22, 28, 18, 10, 6, 12, 20, 16, 10, 8, 12, 6, 6];
// The design shows playback paused at 15 of 39 bars.
const IDLE_PROGRESS = 15 / BARS.length;

const fmt = (s: number) => `0:${String(Math.max(1, Math.round(s))).padStart(2, "0")}`;

/** Text handed to the speech engine: the phonetic spelling reads better lower-cased, without separators. */
function spoken(pronunciation: string, name: string) {
  const p = pronunciation.replace(/[·•\-]/g, " ").replace(/\s+/g, " ").trim();
  return (p || name).toLowerCase();
}

export function VoiceCard({
  name,
  pronunciation,
  onPronunciationChange,
}: {
  name: string;
  pronunciation: string;
  onPronunciationChange: (v: string) => void;
}) {
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(IDLE_PROGRESS);
  const [elapsed, setElapsed] = useState(1);
  const [editing, setEditing] = useState(false);
  const raf = useRef<number>(0);
  const guard = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = pronunciation || name || "Your name";

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    clearTimeout(guard.current);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function stop() {
    cancelAnimationFrame(raf.current);
    clearTimeout(guard.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function play() {
    if (speaking) return stop();
    const text = spoken(pronunciation, name);
    if (!text) return;
    const start = performance.now();
    const estimate = Math.max(900, text.length * 110);
    let ended = false;

    const tick = () => {
      const t = performance.now() - start;
      setElapsed(t / 1000);
      setProgress(ended ? 1 : Math.min(0.95, t / estimate));
      if (!ended) raf.current = requestAnimationFrame(tick);
    };
    const finish = () => {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf.current);
      clearTimeout(guard.current);
      setProgress(1);
      setSpeaking(false);
    };

    setSpeaking(true);
    setProgress(0);
    raf.current = requestAnimationFrame(tick);
    // Some engines never fire onend (no voices installed); don't leave the card stuck "playing".
    clearTimeout(guard.current);
    guard.current = setTimeout(finish, estimate + 2500);

    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) {
      return; // no speech engine: the guard above still animates once

    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.onend = finish;
    u.onerror = finish;
    synth.speak(u);
  }

  return (
    <div className="rounded-card bg-surface px-4 pb-4 pt-[14px]">
      <div className="flex items-start gap-[26px]">
        <img alt="" width={26} height={26} className="mt-[9px] block size-[26px] shrink-0" src={`${IMG}/icon-speaker.svg`} />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[17px] font-semibold leading-[20px] text-white">How Tara says it</p>
          {editing ? (
            <input
              ref={inputRef}
              value={pronunciation}
              onChange={(e) => onPronunciationChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
              placeholder="e.g. PREE · yah"
              aria-label="Phonetic spelling"
              className="mt-0.5 w-full rounded-md bg-white/10 px-1.5 py-0.5 text-[13px] text-white caret-accent outline-none placeholder:text-label-3"
            />
          ) : (
            <p className="mt-0.5 truncate text-[13px] leading-[16px] text-label-2">{label}</p>
          )}
        </div>
        <button
          type="button"
          onClick={play}
          aria-label={speaking ? "Stop" : `Play how Tara says ${name || "your name"}`}
          className="-mr-0.5 shrink-0 rounded-full transition active:scale-95"
        >
          {speaking ? (
            <span className="flex size-[44px] items-center justify-center rounded-full bg-white">
              <span className="flex gap-[5px]">
                <span className="h-[14px] w-[4px] rounded-[1px] bg-black" />
                <span className="h-[14px] w-[4px] rounded-[1px] bg-black" />
              </span>
            </span>
          ) : (
            <img alt="" width={44} height={44} className="block size-[44px]" src={`${IMG}/play.svg`} />
          )}
        </button>
      </div>

      <div className="mt-[22px] flex h-[40px] items-center justify-between" aria-hidden>
        {BARS.map((h, i) => {
          const active = i / BARS.length < progress;
          return (
            <span
              key={i}
              className={speaking ? "tara-wave-bar" : undefined}
              style={{
                width: 4,
                height: h,
                borderRadius: 2,
                background: active ? "var(--color-accent)" : "rgba(255,255,255,0.2)",
                transition: "background-color 120ms linear",
                animationDelay: `${(i % 7) * -90}ms`,
              }}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[13px] tabular-nums text-label-2">{fmt(elapsed)}</span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          className="text-[13px] font-semibold text-white transition active:opacity-60"
        >
          {editing ? "Done" : "Fix how it sounds"}
        </button>
      </div>

      <style>{`
        @keyframes tara-wave { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.45); } }
        .tara-wave-bar { animation: tara-wave 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
