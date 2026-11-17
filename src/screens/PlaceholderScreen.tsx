"use client";

/* Out-of-scope destinations (recipe page, live cooking session): a pushed screen with a back button. */
import { LargeTitleScreen } from "@/proto/ui";

export default function PlaceholderScreen() {
  return (
    <LargeTitleScreen title="Coming soon" back>
      <p className="text-[17px] leading-[22px] text-secondary">This part of the app isn’t in the prototype yet.</p>
    </LargeTitleScreen>
  );
}
