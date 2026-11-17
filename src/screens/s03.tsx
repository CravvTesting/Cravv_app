"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * 03 · Name (2525:2527). Name prefilled from the Apple ID ("Priya"). The play button reads the name
 * aloud with speechSynthesis while the waveform fills. Continue is disabled while the name is empty.
 */
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PrimaryButton, TextField } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen, ScreenHeader } from "@/proto/ui";

// Waveform bar heights from the frame (39 bars, 4px wide, 8.75px pitch, centred on one line).
const BARS = [8, 14, 22, 30, 18, 26, 36, 24, 14, 20, 32, 40, 28, 16, 10, 18, 26, 34, 22, 12, 8, 16, 24, 30, 20, 14, 22, 28, 18, 10, 6, 12, 20, 16, 10, 8, 12, 6, 6];
// The frame shows the first 15 bars "played" at rest.
const REST_PLAYED = 15 / BARS.length;

/** Rough phonetic spelling for the "How Tara says it" line. */
function pronounce(name: string) {
  const n = name.trim();
  if (!n) return "—";
  if (n.toLowerCase() === "priya") return "PREE · yah";
  return n;
}

export default function S03() {
  const m = useMotionTokens();
  const stored = useProto((s) => s.name);
  const set = useProto((s) => s.set);
  const [name, setName] = useState(stored);
  const [fromApple] = useState(stored);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(REST_PLAYED);
  const raf = useRef(0);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }, []);

  const speak = (rate = 0.9) => {
    const text = name.trim();
    if (!text) return;
    cancelAnimationFrame(raf.current);
    setPlaying(true);
    setProgress(0);
    // Sweep the waveform over about a second (the clip is 0:01), longer when spoken slowly.
    const dur = (900 / rate) * m.scale;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setProgress(p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else {
        setPlaying(false);
        setProgress(REST_PLAYED);
      }
    };
    raf.current = requestAnimationFrame(tick);
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.lang = "en-US";
      synth.speak(u);
    } catch { /* speech not available: the waveform still plays */ }
  };

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    set({ name: n });
    go("04");
  };

  const playedBars = Math.round(progress * BARS.length);

  return (
    <Screen
      header={<ScreenHeader steps={3} current={1} />}
      footer={<PrimaryButton disabled={!name.trim()} onClick={submit}>Continue</PrimaryButton>}
    >
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">What should Tara call you?</h1>
      <p className="mt-1.5 text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">She says it out loud while you cook.</p>

      <TextField
        className="mt-6"
        label="Your name"
        value={name}
        onChange={setName}
        placeholder="Your name"
        trailing={name === fromApple && name ? "From Apple ID" : undefined}
        enterKeyHint="next"
        onSubmit={submit}
      />

      <section aria-label="How Tara says it" className="relative mt-4 h-[164px] rounded-[26px] bg-raised">
        <img src="/img/entry/icon-speaker.svg" alt="" width={26} height={26} className="absolute top-[23px] left-4" />
        <p className="absolute top-4 left-[68px] text-[17px] font-semibold leading-[20px] text-white">How Tara says it</p>
        <p className="absolute top-[38px] left-[68px] text-[13px] leading-4 text-secondary">{pronounce(name)}</p>
        <motion.button
          type="button"
          aria-label={`Play how Tara says ${name.trim() || "your name"}`}
          disabled={!name.trim()}
          onClick={() => speak()}
          whileTap={m.reduced ? undefined : { scale: 0.92 }}
          className="absolute top-[14px] right-4 size-11 rounded-full disabled:opacity-35"
        >
          <img src="/img/entry/play.svg" alt="" width={44} height={44} />
        </motion.button>

        <div aria-hidden className="absolute top-[100px] right-4 left-4 flex h-0 items-center justify-between">
          {BARS.map((h, i) => (
            <motion.span
              key={i}
              className="w-1 shrink-0 rounded-[2px]"
              initial={false}
              style={{
                background: i < playedBars ? "var(--cravv-copper-500)" : "rgba(255,255,255,0.2)",
                transition: `background-color ${0.15 * m.scale}s`,
              }}
              animate={{ height: playing && !m.reduced ? h * (i < playedBars ? 1 : 0.7) : h }}
              transition={{ duration: 0.15 * m.scale }}
            />
          ))}
        </div>

        <p className="absolute bottom-4 left-4 text-[13px] leading-4 text-secondary">0:01</p>
        <button
          type="button"
          onClick={() => speak(0.6)}
          className="absolute right-1 bottom-0 flex h-11 items-center px-3 text-[13px] font-semibold text-white active:opacity-50"
        >
          Fix how it sounds
        </button>
      </section>

      <p className="mt-2 px-4 pb-4 text-[13px] leading-[18px] text-secondary">Change your name or how Tara says it anytime in Settings.</p>
    </Screen>
  );
}
