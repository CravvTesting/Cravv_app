import { PrimaryButton, Screen, TextButton } from "@/components/ui";

/* 01 · Meet Tara (Figma 4:677). Replaces splash + 3 intro slides. */

// Callout positions are expressed as % of the 402×600 hero box from the frame.
const pct = (x: number, y: number) => ({ left: `${(x / 402) * 100}%`, top: `${(y / 600) * 100}%` });

function Callout({ n, label, x, y }: { n: string; label: string; x: number; y: number }) {
  return (
    <div
      className="absolute flex gap-2 whitespace-nowrap rounded-full bg-black/50 px-2.5 py-1.5 text-[10px] uppercase leading-[14px] tracking-[0.4px] backdrop-blur-[8px]"
      style={pct(x, y)}
    >
      <span className="font-semibold text-accent">{n}</span>
      <span className="font-medium text-white/80">{label}</span>
    </div>
  );
}

export default function MeetTara() {
  return (
    <Screen padded={false}>
      <div className="relative aspect-[402/600] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/tara-hero.jpg" alt="Tara's round kitchen display on its stand, with the camera module docked in the base" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(28,28,31,0.35) 0%, rgba(28,28,31,0) 14%, rgba(28,28,31,0) 50%, rgba(22,22,26,0.85) 80%, #121214 100%)" }}
        />
        <p className="absolute w-full text-center text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px] text-white/50" style={{ top: `${(70 / 600) * 100}%` }}>
          Tara&nbsp;&nbsp;·&nbsp;&nbsp;Display + camera module
        </p>
        <Callout n="01" label="Display" x={39} y={104} />
        <Callout n="02" label="Camera, docked" x={252} y={527} />
        {/* Leader lines + nodes */}
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/img/leader-display.svg" alt="" className="absolute" style={{ ...pct(125, 117), width: `${(80 / 402) * 100}%`, height: `${(64 / 600) * 100}%` }} />
        <img src="/img/leader-node.svg" alt="" width={6} height={6} className="absolute" style={pct(203, 179)} />
        <img src="/img/leader-camera.svg" alt="" className="absolute" style={{ ...pct(171, 500), width: `${(81 / 402) * 100}%`, height: `${(41 / 600) * 100}%` }} />
        <img src="/img/leader-node.svg" alt="" width={6} height={6} className="absolute" style={pct(168, 497)} />
        {/* eslint-enable @next/next/no-img-element */}
      </div>

      <div className="-mt-1 px-5 text-center">
        <h1 className="text-[40px] font-bold leading-[46px] tracking-[0.37px]">Meet Tara</h1>
        <p className="mt-2 text-[17px] leading-[22px] tracking-[-0.43px] text-label-2">She watches the stove while you cook.</p>
      </div>

      <div className="mt-auto flex flex-col gap-1.5 px-5 pt-8">
        <PrimaryButton href="/signup">Get Started</PrimaryButton>
        <TextButton href="/signin">Sign In</TextButton>
      </div>
    </Screen>
  );
}
