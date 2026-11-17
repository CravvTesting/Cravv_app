"use client";

/*
 * 11 · Your stove. "Tara is online" pill slides in (motion moment 6), stove type single-select,
 * Burners 1–5 bound to the store; the preview plan morphs with the count (motion moment 7).
 */
import { motion } from "motion/react";
import { ListGroup, ListRow, PrimaryButton, SectionTitle, SegmentedControl, StatusPill, StovePreview, STOVE_TYPES } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto, type Burners } from "@/proto/store";
import { Screen, ScreenHeader } from "@/proto/ui";

const BURNERS = [1, 2, 3, 4, 5] as const satisfies readonly Burners[];

export default function S11() {
  const m = useMotionTokens();
  const stoveType = useProto((s) => s.stoveType);
  const burners = useProto((s) => s.burners);
  const wifi = useProto((s) => s.wifi);
  const set = useProto((s) => s.set);
  const typeLabel = STOVE_TYPES.find((t) => t.id === stoveType)?.label ?? STOVE_TYPES[2].label;

  return (
    <Screen
      header={<ScreenHeader steps={4} current={3} />}
      footer={<PrimaryButton onClick={() => go("12")}>Continue</PrimaryButton>}
    >
      <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.4px]">Your Stove</h1>
      <motion.div
        className="mt-[7px] flex"
        initial={m.reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...m.spring, delay: 0.3 * m.scale }}
      >
        <StatusPill tone="success">Tara is online · {wifi}</StatusPill>
      </motion.div>

      <StovePreview className="mt-[14px]" burners={burners} type={typeLabel} />

      <SectionTitle className="pt-6">Stove type</SectionTitle>
      <ListGroup label="Stove type">
        {STOVE_TYPES.map((t) => (
          <ListRow
            key={t.id}
            label={t.label}
            icon={t.icon}
            token={t.token}
            selected={stoveType === t.id}
            onClick={() => set({ stoveType: t.id })}
          />
        ))}
      </ListGroup>

      <SectionTitle className="pt-[19px]">Burners</SectionTitle>
      <SegmentedControl
        className="mb-4"
        label="Burners"
        options={BURNERS}
        value={burners}
        onChange={(b) => set({ burners: b })}
      />
    </Screen>
  );
}
