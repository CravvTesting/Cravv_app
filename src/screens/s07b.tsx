"use client";

import { go } from "@/proto/nav";
import { SystemAlert } from "@/proto/ui";

/**
 * 07b · iOS Bluetooth prompt (Figma 2626:4660), overlay on 07a.
 * Allow → 07. Don't Allow → 07c. Both replace 07b in history so Back from 07/07c skips the alert.
 */
export default function S07b() {
  return (
    <SystemAlert
      title="“Cravv” Would Like to Use Bluetooth"
      message="Tara pairs with your iPhone over Bluetooth during setup."
      actions={[
        { label: "Don’t Allow", onPress: () => go("07c", { replace: true }) },
        { label: "Allow", bold: true, onPress: () => go("07", { replace: true }) },
      ]}
    />
  );
}
