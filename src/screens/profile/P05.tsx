"use client";

/* P05 · Sign out? (2673:6377). Action sheet over P01. Sign Out resets the prototype → onboarding 01. */
import { ActionSheet } from "@/components/cravv";
import { back, exitToOnboarding } from "@/proto/nav";
import { useProto } from "@/proto/store";

export default function P05() {
  const signOut = () => {
    useProto.getState().reset();
    exitToOnboarding("01");
  };
  return (
    <ActionSheet
      title="Sign out of Cravv?"
      message="Your recipes, Meal Log and Tara stay linked to your account."
      actions={[{ label: "Sign Out", destructive: true, onPress: signOut }]}
      onCancel={() => back()}
      // Above the shell's tab bar (z-70): the dim covers it in the frame.
      className="z-[80]!"
    />
  );
}
