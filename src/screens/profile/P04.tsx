"use client";

/*
 * P04 · Camera and privacy (2673:6279). "Tara is seeing" chip only while a cook or watch is live.
 * Save dish photos and Pause camera persist (camera.*); while paused the shell's mini bar reads
 * "Camera paused". Delete Cooking Photos → action sheet → removes photos from the Meal Log.
 */
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { ActionSheet, SettingsGroup } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { GROUP_GAP, Row } from "./rows";

export default function P04() {
  const m = useMotionTokens();
  const camera = useProto((s) => s.camera);
  const live = useProto((s) => s.live);
  const hasPhotos = useProto((s) => s.meals.some((meal) => !!meal.photo));
  const set = useProto((s) => s.set);
  const [confirm, setConfirm] = useState(false);
  const patch = (p: Partial<typeof camera>) => set({ camera: { ...useProto.getState().camera, ...p } });

  const deletePhotos = () => {
    const meals = useProto.getState().meals.map((meal) => {
      if (!meal.photo) return meal;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { photo, ...rest } = meal;
      return rest;
    });
    set({ meals });
    setConfirm(false);
  };

  return (
    <>
      <LargeTitleScreen title="Camera and privacy" back subtitle="Tara’s camera faces your stove. Here’s when it looks and what it keeps.">
        <div className="relative -mt-0.5 h-[150px] overflow-hidden rounded-[16px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/profile/live-view.webp" alt="Tara’s view of the stove" className="absolute inset-0 size-full object-cover" />
          <div
            className="absolute left-3 top-3 flex h-7 items-center gap-1.5 rounded-[14px] bg-black/55 pl-2.5 pr-3"
            style={{ opacity: live && !camera.paused ? 1 : 0, transition: `opacity ${0.3 * m.scale}s ease` }}
            aria-hidden={!live || camera.paused}
          >
            <span className="size-2 rounded-full" style={{ background: "var(--cravv-status-success)" }} />
            <span className="text-[13px] font-semibold leading-4 text-white">Tara is seeing</span>
          </div>
        </div>

        <SettingsGroup header="When Tara looks" className={GROUP_GAP}>
          <Row label="During a guided cook" value="On" />
          <Row label="While watching a burner" value="On" />
          <Row label="Any other time" value="Off" />
        </SettingsGroup>

        <SettingsGroup header="What’s kept" className={GROUP_GAP}>
          <Row label="Save dish photos" subtitle="Shown in your Meal Log" switchOn={camera.saveDishPhotos} onSwitch={(v) => patch({ saveDishPhotos: v })} />
          <Row label="Delete Cooking Photos" labelColor="var(--cravv-status-alert)" onPress={() => setConfirm(true)} />
        </SettingsGroup>

        <SettingsGroup className="mt-6">
          <Row label="Pause camera" subtitle="Guidance and watching stop" switchOn={camera.paused} onSwitch={(v) => patch({ paused: v })} />
        </SettingsGroup>
      </LargeTitleScreen>

      <AnimatePresence>
        {confirm && (
          <ActionSheet
            title="Delete cooking photos?"
            message={hasPhotos ? "Dish photos are removed from your Meal Log. Your meals and notes stay." : "There are no cooking photos saved right now."}
            actions={[{ label: "Delete Photos", destructive: true, onPress: deletePhotos }]}
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
