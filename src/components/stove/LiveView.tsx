/* eslint-disable @next/next/no-img-element */
"use client";

export type LiveTone = "accent" | "success" | "warning";

const suffix: Record<LiveTone, string> = { accent: "", success: "-success", warning: "-warning" };

/** Simulated camera live view: stove feed, scrim, corner brackets, LIVE badge, status pill. */
export function LiveView({ tone, status }: { tone: LiveTone; status: string }) {
  const s = suffix[tone];
  const pill = "absolute flex h-7 items-center rounded-[14px] bg-black/50 backdrop-blur-[7px]";
  return (
    <div className="relative h-[clamp(180px,calc(100dvh-490px),300px)] w-full overflow-hidden rounded-[26px] bg-black">
      <img src="/img/stove/camera-feed.jpg" alt="Live view of your stove" className="absolute inset-0 size-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55) 100%)" }}
      />
      <img src={`/img/stove/corner-tl${s}.svg`} alt="" width={20.5} height={20.5} className="absolute left-[14.75px] top-[14.75px]" />
      <img src={`/img/stove/corner-tr${s}.svg`} alt="" width={20.5} height={20.5} className="absolute right-[14.75px] top-[14.75px]" />
      <img src={`/img/stove/corner-br${s}.svg`} alt="" width={20.5} height={20.5} className="absolute bottom-[14.75px] right-[14.75px]" />
      <img src={`/img/stove/corner-bl${s}.svg`} alt="" width={20.5} height={20.5} className="absolute bottom-[14.75px] left-[14.75px]" />

      <div className={`${pill} left-7 top-[26px] gap-1.5 pl-2.5 pr-3`}>
        <img src="/img/stove/dot-live.svg" alt="" width={7} height={7} className="animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.66px] text-white">Live</span>
      </div>
      <div className={`${pill} right-7 top-[26px] pl-2.5 pr-3`}>
        <span className="whitespace-nowrap text-[11px] font-medium text-white">Camera module</span>
      </div>
      <div className={`${pill} bottom-5 left-1/2 -translate-x-1/2 gap-1.5 pl-2.5 pr-3`} aria-live="polite">
        <img src={`/img/stove/dot-${tone}.svg`} alt="" width={7} height={7} />
        <span className="whitespace-nowrap text-[13px] font-semibold text-white">{status}</span>
      </div>
    </div>
  );
}
