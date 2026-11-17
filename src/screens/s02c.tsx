"use client";

/* eslint-disable @next/next/no-img-element */
/*
 * 02c · Welcome back (2526:2670). Restored setup summary for a returning user with a linked Tara.
 * Go to Home ends onboarding; Set Up Another Tara → 07a.
 */
import { motion } from "motion/react";
import { DIETS, PrimaryButton, STOVE_TYPES, TextButton } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { Screen } from "@/proto/ui";
import { RowIcon, SummaryCard } from "./entry/SummaryCard";

export default function S02c() {
  const m = useMotionTokens();
  const name = useProto((s) => s.name) || "Priya";
  const stoveType = useProto((s) => s.stoveType);
  const diet = useProto((s) => s.diet);
  const set = useProto((s) => s.set);

  const stove = STOVE_TYPES.find((s) => s.id === stoveType)?.label ?? "Electric coil";
  const dietLabel = diet.map((d) => DIETS.find((o) => o.id === d)?.label ?? d).join(", ") || "Everything";

  const rows = [
    {
      key: "tara",
      label: "Tara",
      icon: <RowIcon name="display" />,
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-success" />
          Kitchen · Online
        </span>
      ),
    },
    { key: "stove", label: "Stove", icon: <RowIcon name="stove" />, value: stove },
    { key: "diet", label: "Diet", icon: <RowIcon name="sliders" />, value: dietLabel },
    { key: "saved", label: "Saved recipes", icon: <RowIcon name="bookmark" />, value: "23" },
  ];

  const rise = (i: number) =>
    m.reduced
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: m.fade }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { ...m.spring, delay: (0.1 + i * 0.06) * m.scale } };

  return (
    <Screen
      footer={
        <div className="flex flex-col gap-1.5">
          <PrimaryButton
            onClick={() => {
              set({ done: true });
              go("home");
            }}
          >
            Go to Home
          </PrimaryButton>
          <TextButton onClick={() => go("07a")}>Set Up Another Tara</TextButton>
        </div>
      }
    >
      <div className="flex flex-col items-center pt-[56px] text-center">
        <motion.div {...rise(0)} className="relative size-[76px]">
          <img src="/img/entry/avatar.svg" alt="" width={76} height={76} />
          <span className="absolute inset-0 flex items-center justify-center text-[32px] font-semibold text-white">{name.charAt(0).toUpperCase()}</span>
        </motion.div>
        <motion.h1 {...rise(1)} className="mt-[22px] text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">
          Welcome back, {name}
        </motion.h1>
        <motion.p {...rise(2)} className="mt-[5px] text-[17px] leading-[22px] tracking-[-0.43px] text-secondary">
          Everything is where you left it.
        </motion.p>
      </div>
      <motion.div {...rise(3)}>
        <SummaryCard rows={rows} className="mt-[34px]" />
        <p className="mt-2 px-4 pb-4 text-[13px] leading-[18px] text-secondary">
          Signing in on a new phone changes nothing on Tara. Your stove and burners stay set up.
        </p>
      </motion.div>
    </Screen>
  );
}
