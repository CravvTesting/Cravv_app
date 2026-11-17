"use client";

import { motion } from "motion/react";
import { CloseButton, PrimaryButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { IMG, Img, TaraDrawing } from "./connect/parts";

/**
 * 09 · Pair Tara (Figma 2525:2862). iOS accessory-setup style card over the kitchen photo.
 * The card rises in after the search collapse on 08. Connect → 10. Close → 07.
 */
export default function S09() {
  const m = useMotionTokens();
  return (
    <div className="cravv-bg relative h-full w-full overflow-hidden">
      {/* Kitchen photo (two layers, as in the frame) with its fades and dim. */}
      <div className="absolute inset-x-0 top-0 h-[600px] max-h-[75%] overflow-hidden">
        <Img src={`${IMG}/kitchen-a.webp`} className="absolute inset-0 size-full object-cover" />
        <Img src={`${IMG}/kitchen-b.webp`} className="absolute left-[-5.69%] top-[0.06%] h-[93.2%] w-[111.28%] object-cover" />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(28,28,31,0) 0%, #121214 93.833%)" }} />
      </div>
      <div className="absolute inset-0 bg-black/30" />

      <motion.section
        aria-labelledby="pair-title"
        className="absolute inset-x-2 overflow-hidden rounded-[38px] px-5 text-center"
        style={{
          background: "#26262a",
          bottom: "max(calc(env(safe-area-inset-bottom) - 26px), 8px)",
          paddingBottom: "max(calc(env(safe-area-inset-bottom) - 12px), 22px)",
        }}
        initial={m.reduced ? { opacity: 0 } : { y: "100%", opacity: 1 }}
        animate={m.reduced ? { opacity: 1 } : { y: 0 }}
        transition={m.reduced ? m.fade : { ...m.sheet, delay: 0.05 * m.scale }}
      >
        <div className="absolute right-4 top-[17px]">
          <CloseButton onClick={() => go("07", { dir: "pop" })} />
        </div>
        <TaraDrawing className="mx-auto mt-10" />
        <p className="mt-2 whitespace-pre text-[10px] font-semibold uppercase leading-[14px] tracking-[0.4px]" style={{ color: "var(--cravv-text-accent)" }}>
          {"Found nearby  ·  2 parts"}
        </p>
        <h1 id="pair-title" className="mt-1.5 text-[28px] font-bold leading-[34px] tracking-[0.38px] text-white">
          Tara
        </h1>
        <p className="mt-1 text-[15px] leading-5 tracking-[-0.23px] text-secondary">Kitchen display and camera module</p>
        <p className="mx-auto mt-[18px] max-w-[290px] text-[13px] leading-[18px] tracking-[-0.08px] text-secondary">
          Tara’s screen shows{" "}
          <span className="font-semibold" style={{ color: "var(--cravv-text-accent)" }}>
            4F2
          </span>
          . Check it matches, then connect.
        </p>
        <PrimaryButton className="mt-[26px]" onClick={() => go("10")}>
          Connect
        </PrimaryButton>
      </motion.section>
    </div>
  );
}
