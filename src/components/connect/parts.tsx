"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { cx } from "@/components/ui";

/** Round liquid-glass "xmark" button (09), same look as the shared BackButton. */
export function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClick}
      className={cx(
        "flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-xl transition active:scale-95",
        className
      )}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path d="M2 2l14 14M16 2L2 16" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** iOS grouped-list section header used on 10 (17 semibold, secondary label at 70%). */
export function ListHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex h-[39px] items-end px-4 pb-[9px] text-[17px] font-semibold leading-[22px] tracking-[-0.43px] text-[rgba(235,235,245,0.7)]">
      {children}
    </h2>
  );
}

/** Tara line drawing (front, colour). Native size 202.941 × 150. */
export function TaraDrawing({ className }: { className?: string }) {
  return <img src="/img/connect/tara-drawing.svg" alt="Tara" width={202.941} height={150} className={className} />;
}

const BRACKETS = [
  { src: "/img/connect/bracket-tl.svg", pos: "left-[20px] top-[20px]" },
  { src: "/img/connect/bracket-tr.svg", pos: "left-[178px] top-[20px]" },
  { src: "/img/connect/bracket-br.svg", pos: "left-[178px] top-[178px]" },
  { src: "/img/connect/bracket-bl.svg", pos: "left-[20px] top-[178px]" },
];

/**
 * 08 / 08x illustration: Tara in a scan frame with copper corner brackets
 * and two radar rings, all centred on the same point (208 × 208 box).
 */
export function SearchIllustration({ searching }: { searching: boolean }) {
  return (
    <div className="relative mx-auto h-[208px] w-[208px]" aria-hidden>
      <style>{`
        @keyframes tara-ring { 0% { opacity: 0; transform: scale(.82) } 35% { opacity: 1 } 100% { opacity: 0; transform: scale(1.06) } }
        .tara-ring { animation: tara-ring 2.4s ease-out infinite; }
        .tara-ring-2 { animation-delay: .5s; }
      `}</style>
      <img
        src="/img/connect/ring-outer.svg"
        alt=""
        width={208}
        height={208}
        className={cx("absolute left-0 top-0", searching && "tara-ring tara-ring-2")}
      />
      <img
        src="/img/connect/ring-inner.svg"
        alt=""
        width={176}
        height={176}
        className={cx("absolute left-4 top-4", searching && "tara-ring")}
      />
      <div className="absolute left-[19px] top-[20px] h-[168px] w-[169px] border border-white/12 bg-[rgba(217,217,217,0.03)]" />
      <TaraDrawing className="absolute left-[2.53px] top-[29px]" />
      {BRACKETS.map((b) => (
        <img key={b.src} src={b.src} alt="" width={11.5} height={11.5} className={cx("absolute -m-[0.75px]", b.pos)} />
      ))}
    </div>
  );
}
