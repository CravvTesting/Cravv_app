/* eslint-disable @next/next/no-img-element */
import type { StoveType } from "@/lib/store";

const COPPER = "#C98B58";

type B = { x: number; y: number; r: number };

/** Burner positions inside the 126×126 plan, per burner count. 4 follows the Figma plan. */
const LAYOUTS: Record<number, B[]> = {
  2: [{ x: 38, y: 63, r: 22 }, { x: 88, y: 63, r: 22 }],
  4: [{ x: 36, y: 36, r: 22 }, { x: 90, y: 36, r: 17 }, { x: 36, y: 90, r: 17 }, { x: 90, y: 90, r: 22 }],
  5: [{ x: 31, y: 31, r: 16 }, { x: 95, y: 31, r: 16 }, { x: 31, y: 95, r: 16 }, { x: 95, y: 95, r: 16 }, { x: 63, y: 63, r: 17 }],
  6: [{ x: 26, y: 40, r: 15 }, { x: 63, y: 40, r: 15 }, { x: 100, y: 40, r: 15 }, { x: 26, y: 86, r: 15 }, { x: 63, y: 86, r: 15 }, { x: 100, y: 86, r: 15 }],
};

function spiral({ x, y, r }: B) {
  const turns = r > 18 ? 5 : 4;
  const steps = turns * 36;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const rr = 1.5 + t * (r - 1.5);
    d += `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(2)} ${(y + rr * Math.sin(a)).toFixed(2)}`;
  }
  return <path d={d} stroke={COPPER} strokeWidth={0.9} fill="none" strokeLinecap="round" />;
}

function Burner({ b, type }: { b: B; type: StoveType }) {
  switch (type) {
    case "electric-coil":
      return spiral(b);
    case "gas":
      return (
        <g stroke={COPPER} fill="none" strokeWidth={1}>
          <circle cx={b.x} cy={b.y} r={b.r} />
          <circle cx={b.x} cy={b.y} r={b.r * 0.55} />
          <circle cx={b.x} cy={b.y} r={b.r * 0.2} fill={COPPER} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={b.x + Math.cos(a) * b.r * 0.62} y1={b.y + Math.sin(a) * b.r * 0.62} x2={b.x + Math.cos(a) * b.r * 0.9} y2={b.y + Math.sin(a) * b.r * 0.9} strokeLinecap="round" />;
          })}
        </g>
      );
    case "induction":
      return (
        <g stroke={COPPER} fill="none">
          <circle cx={b.x} cy={b.y} r={b.r} strokeWidth={1.2} />
          <circle cx={b.x} cy={b.y} r={b.r - 4} strokeWidth={0.6} strokeOpacity={0.6} />
        </g>
      );
    case "infrared":
      return (
        <g>
          <circle cx={b.x} cy={b.y} r={b.r} fill="url(#ir)" />
          <circle cx={b.x} cy={b.y} r={b.r} stroke={COPPER} strokeWidth={1} fill="none" />
        </g>
      );
  }
}

/** Top-down stove plan. Uses the Figma asset for the designed state (electric coil · 4). */
export function StovePlan({ type, burners }: { type: StoveType; burners: number }) {
  if (type === "electric-coil" && burners === 4) {
    return <img src="/img/stove/plan-electric-coil-4.svg" alt="Electric coil stove, 4 burners" width={126} height={126} className="shrink-0" />;
  }
  const layout = LAYOUTS[burners] ?? LAYOUTS[4];
  return (
    <svg width={126} height={126} viewBox="0 0 126 126" fill="none" className="shrink-0" role="img" aria-label={`${type} stove, ${burners} burners`}>
      <defs>
        <radialGradient id="ir">
          <stop offset="0" stopColor={COPPER} stopOpacity={0.55} />
          <stop offset="1" stopColor={COPPER} stopOpacity={0.08} />
        </radialGradient>
      </defs>
      <rect width="126" height="126" rx="20" fill="#232326" />
      <rect x="0.5" y="0.5" width="125" height="125" rx="19.5" stroke="white" strokeOpacity="0.08" />
      {layout.map((b, i) => (
        <Burner key={i} b={b} type={type} />
      ))}
    </svg>
  );
}
