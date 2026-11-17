"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { TextButton, Viewfinder } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go, useNav } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { TIMING } from "@/proto/timing";
import { Screen, ScreenHeader } from "@/proto/ui";
import { IMG, SearchRings, SearchTile, TaraDrawing, TitleBlock } from "./connect/parts";

/**
 * 08 · Looking for Tara (Figma 2532:2850). Rings pulse outwards around the drawing.
 * Debug "Find Tara":
 *  - found → after TIMING.searchFound the rings collapse into the drawing, then → 09 (its card rises).
 *  - can't find → after TIMING.searchTimeout → 08x (sheet over this screen).
 *  - already set up → after TIMING.searchFound → 09x (sheet over this screen).
 * 08x / 09x render on top of this component, so it reads the current id to hold the search
 * and show the static rings from those frames. Try Again (08x → 08) re-runs the search.
 * Cancel → 07.
 */
export default function S08() {
  const { id } = useNav();
  const find = useProto((s) => s.debug.find);
  const speed = useProto((s) => s.debug.speed);
  const m = useMotionTokens();
  const searching = id === "08";
  const [found, setFound] = useState(false);
  const collapseMs = (m.reduced ? 0.2 : 0.5) * m.scale * 1000;

  useEffect(() => {
    if (!searching) return;
    setFound(false);
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (find === "cant-find") {
      timers.push(setTimeout(() => go("08x"), TIMING.searchTimeout / speed));
    } else if (find === "already-set-up") {
      timers.push(setTimeout(() => go("09x"), TIMING.searchFound / speed));
    } else {
      timers.push(
        setTimeout(() => {
          setFound(true);
          timers.push(setTimeout(() => go("09", { dir: "none" }), collapseMs));
        }, TIMING.searchFound / speed)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [searching, find, speed, collapseMs]);

  const ringMode = found ? "collapse" : searching ? "pulse" : "static";
  const status = found || id === "09x" ? "Bluetooth · Found" : "Bluetooth · Searching";

  return (
    <Screen
      header={
        <>
          <ScreenHeader steps={4} current={1} />
          <p className="-mt-[3px] pr-2 text-right text-[9px] font-medium uppercase leading-[11px] tracking-[0.54px] text-white/45" aria-live="polite">
            {status}
          </p>
        </>
      }
      footer={<TextButton onClick={() => back()}>Cancel</TextButton>}
    >
      <div className="relative mx-auto mt-[14px] h-[168px] w-[169px]">
        <SearchRings mode={ringMode} />
        <Viewfinder size={{ width: 169, height: 168 }}>
          <div className="absolute inset-0 border border-white/12 bg-[rgba(217,217,217,0.03)]" />
        </Viewfinder>
        <motion.div
          className="absolute left-1/2 top-[9px] -ml-[101.47px]"
          animate={found && !m.reduced ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 * m.scale, ease: "easeOut" }}
        >
          <TaraDrawing />
        </motion.div>
      </div>

      <TitleBlock
        className="mt-[41px]"
        title="Looking for Tara"
        bodyWidth={300}
        body="Keep your phone close to the display. This takes a few seconds."
      />

      <div className="mt-[26px] grid grid-cols-2 gap-3 pb-4">
        <SearchTile icon={`${IMG}/icon-phone.svg`} label="Stay close" hint="Within 10 feet of the display" />
        <SearchTile icon={`${IMG}/icon-bt.svg`} label="Bluetooth" hint="Only used during setup" />
      </div>
    </Screen>
  );
}
