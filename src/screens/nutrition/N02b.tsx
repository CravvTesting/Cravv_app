"use client";

/*
 * N02b · Height picker (2601:4219). Sheet over N02 with a ft/in wheel (cm wheel in metric).
 * Cancel / drag / dim → back to N02. Done writes body.heightIn and goes back.
 */
import { useId, useRef } from "react";
import { back } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Sheet } from "@/proto/ui";
import { cmToIn, inToCm } from "./setup/calc";
import { PickerHeader, range, Wheel, WheelBand, WHEEL_ROW } from "./setup/parts";

const FT = range(3, 7);
const IN = range(0, 11);
const CM = range(100, 230);

function Unit({ children }: { children: string }) {
  return (
    <span className="w-10 pl-2 text-[17px] text-secondary" style={{ marginTop: WHEEL_ROW * 2 + 8 }}>
      {children}
    </span>
  );
}

export default function N02b() {
  const body = useProto((s) => s.body);
  const metric = useProto((s) => s.units === "metric");
  const set = useProto((s) => s.set);
  const titleId = useId();
  const ft = useRef(Math.min(7, Math.max(3, Math.floor(body.heightIn / 12))));
  const inch = useRef(body.heightIn % 12);
  const cm = useRef(inToCm(body.heightIn));

  const close = () => back("N02");
  const done = () => {
    const heightIn = metric ? cmToIn(cm.current) : ft.current * 12 + inch.current;
    set({ body: { ...useProto.getState().body, heightIn } });
    close();
  };

  return (
    <Sheet onDismiss={close} label="Height">
      <PickerHeader title="Height" onCancel={close} onDone={done} titleId={titleId} />
      <div className="relative mt-4">
        <WheelBand />
        {metric ? (
          <div className="relative flex items-start justify-center">
            <Wheel className="w-[100px]" values={CM} value={cm.current} onChange={(v) => (cm.current = v)} label="Height in centimetres" />
            <Unit>cm</Unit>
          </div>
        ) : (
          <div className="relative flex items-start">
            <Wheel className="ml-[70px] w-[80px]" values={FT} value={ft.current} onChange={(v) => (ft.current = v)} label="Feet" />
            <Unit>ft</Unit>
            <Wheel className="ml-[10px] w-[80px]" values={IN} value={inch.current} onChange={(v) => (inch.current = v)} label="Inches" />
            <Unit>in</Unit>
          </div>
        )}
      </div>
      <p className="mt-6 px-5 pb-2 text-center text-[13px] leading-[18px] text-secondary">
        Your height is kept private and only used for your targets.
      </p>
    </Sheet>
  );
}
