"use client";

/*
 * J04 Photo log: the "photo" sits on top, a fake 1.5 s estimate (÷ debug Speed), then the
 * estimate with a portion stepper. Add → appends the meal (source "photo", today) and pops to
 * J01, where the new row expands in place and the day total ticks up.
 */
import { useEffect, useState } from "react";
import { BackButton, PrimaryButton, Spinner } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { TODAY } from "@/proto/seed/meals";
import { useSpeed } from "@/proto/timing";
import { MEAL_PHOTOS, SLOT_LABEL, nextSlot, nowTime, useJournalUi } from "./data";
import { SECONDARY, Stepper, TERTIARY } from "./parts";

const ESTIMATE_MS = 1500;
const KCAL_PER_PIECE = 70; // 6 pieces ≈ 420 kcal (frame)
const PROTEIN_PER_PIECE = 28 / 6;

export default function J04() {
  const speed = useSpeed();
  const m = useMotionTokens();
  const meals = useProto((s) => s.meals);
  const setStore = useProto((s) => s.set);
  const slot = nextSlot(meals);
  const [ready, setReady] = useState(false);
  const [pieces, setPieces] = useState(6);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), ESTIMATE_MS / speed);
    return () => clearTimeout(t);
  }, [speed]);

  const kcal = pieces * KCAL_PER_PIECE;
  const protein = Math.round(pieces * PROTEIN_PER_PIECE);

  const add = () => {
    const id = `m-${Date.now().toString(36)}`;
    setStore({
      meals: [...meals, { id, day: TODAY, slot, name: "Paneer tikka", kcal, protein, time: nowTime(), source: "photo", note: `${pieces} pieces`, photo: MEAL_PHOTOS["Paneer tikka"] }],
    });
    useJournalUi.getState().set({ justAdded: id });
    go("J01", { dir: "pop" });
  };

  const fade = (on: boolean, delay = 0) => ({
    opacity: on ? 1 : 0,
    transform: on || m.reduced ? "none" : "translateY(8px)",
    transition: `opacity ${0.3 * m.scale}s ease ${delay * m.scale}s, transform ${0.4 * m.scale}s var(--ease-ios) ${delay * m.scale}s`,
  });

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-recessed">
      {/* Camera view */}
      <div className="absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MEAL_PHOTOS["Paneer tikka"]} alt="Photo of your plate: paneer tikka with chutneys" className="size-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-black/15" />
        <Corners />
      </div>
      <div className="absolute left-4 z-20" style={{ top: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center"><BackButton onClick={() => back()} /></div>
      </div>

      {/* Result */}
      <div className="relative z-10 mt-auto flex min-h-[394px] flex-col rounded-t-[28px] bg-recessed px-5 pt-[22px]" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>
        <div className="relative flex-1">
          <div aria-live="polite" className="absolute inset-x-0 top-0 flex items-center gap-2.5 text-[15px]" style={{ ...fade(!ready), color: SECONDARY, pointerEvents: ready ? "none" : undefined }}>
            <Spinner size={18} label="" />
            Estimating from your photo…
          </div>
          <div style={fade(ready)} aria-hidden={!ready}>
            <p className="text-[12px] font-semibold uppercase leading-[14px]" style={{ color: TERTIARY }}>Looks like</p>
            <h1 className="mt-1 text-[24px] font-bold leading-[29px] text-white">Paneer tikka</h1>
            <p className="mt-[3px] text-[13px] leading-4" style={{ color: SECONDARY }}>Estimate from the photo · tap to change</p>
            <div className="mt-4 flex h-16 items-center justify-between rounded-[16px] pl-4 pr-4" style={{ background: "var(--cravv-surface-secondary)" }}>
              <span className="text-[16px] font-semibold text-white">Portion</span>
              <Stepper
                size="lg"
                label="Portion"
                value={`${pieces} ${pieces === 1 ? "piece" : "pieces"}`}
                onMinus={() => setPieces((p) => Math.max(1, p - 1))}
                onPlus={() => setPieces((p) => Math.min(20, p + 1))}
                minusDisabled={pieces <= 1}
              />
            </div>
            <p className="mt-[18px] text-[15px] font-semibold text-white tabular-nums">About {kcal} kcal · {protein} g protein</p>
          </div>
        </div>
        <PrimaryButton onClick={add} disabled={!ready}>Add to {SLOT_LABEL[slot]}</PrimaryButton>
      </div>
    </div>
  );
}

/** White viewfinder corners (22px, 2.5px stroke) at the frame's positions (70/130 → 332/420). */
function Corners() {
  const c = "M1.25 21V1.25H21";
  const pos = [
    { left: 70, top: 130, r: 0 },
    { left: 310, top: 130, r: 90 },
    { left: 310, top: 398, r: 180 },
    { left: 70, top: 398, r: 270 },
  ];
  return (
    <div aria-hidden className="absolute left-1/2 top-0 h-[520px] w-[402px] -translate-x-1/2">
      {pos.map((p, i) => (
        <svg key={i} width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute" style={{ left: p.left, top: p.top, transform: `rotate(${p.r}deg)` }}>
          <path d={c} stroke="white" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      ))}
    </div>
  );
}
