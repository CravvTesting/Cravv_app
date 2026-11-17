import type { ComponentType } from "react";
import type { ScreenId } from "@/proto/store";

import S01 from "./s01";
import Auth from "./auth";
import S02c from "./s02c";
import S03 from "./s03";
import S04 from "./s04";
import S05 from "./s05";
import S06 from "./s06";
import S07a from "./s07a";
import S07b from "./s07b";
import S07c from "./s07c";
import S07 from "./s07";
import S07h from "./s07h";
import S08 from "./s08";
import S08x from "./s08x";
import S09 from "./s09";
import S09x from "./s09x";
import S10 from "./s10";
import S10b from "./s10b";
import S11 from "./s11";
import S12 from "./s12";
import S12h from "./s12h";
import S13 from "./s13";
import S13n from "./s13n";
import S14 from "./s14";
import S14b from "./s14b";
import Home from "./home";

export type ScreenProps = { id: ScreenId };

export type Entry = {
  Component: ComponentType<ScreenProps>;
  /**
   * Screens sharing a group don't slide between each other; the component gets the new id
   * and animates internally (02 ↔ 02b ↔ 02x sheet morph, 10 ↔ 10x, 13 ↔ 13p/r/s/x/y).
   */
  group?: string;
  /**
   * Overlay screens (sheets, system alerts) render on top of `base`, which stays put.
   * Their Component renders only the overlay (use <Sheet> or <SystemAlert> from @/proto/ui).
   */
  base?: ScreenId;
};

export const REGISTRY: Record<ScreenId, Entry> = {
  "01": { Component: S01 },
  "02": { Component: Auth, group: "auth" },
  "02b": { Component: Auth, group: "auth" },
  "02x": { Component: Auth, group: "auth" },
  "02c": { Component: S02c },
  "03": { Component: S03 },
  "04": { Component: S04 },
  "05": { Component: S05 },
  "06": { Component: S06 },
  "07a": { Component: S07a },
  "07b": { Component: S07b, base: "07a" },
  "07c": { Component: S07c },
  "07": { Component: S07 },
  "07h": { Component: S07h, base: "07" },
  "08": { Component: S08 },
  "08x": { Component: S08x, base: "08" },
  "09": { Component: S09 },
  "09x": { Component: S09x, base: "08" },
  "10": { Component: S10, group: "10" },
  "10x": { Component: S10, group: "10" },
  "10b": { Component: S10b },
  "11": { Component: S11 },
  "12": { Component: S12 },
  "12h": { Component: S12h, base: "12" },
  "13": { Component: S13, group: "13" },
  "13p": { Component: S13, group: "13" },
  "13r": { Component: S13, group: "13" },
  "13s": { Component: S13, group: "13" },
  "13x": { Component: S13, group: "13" },
  "13y": { Component: S13, group: "13" },
  "13n": { Component: S13n },
  "14": { Component: S14 },
  "14b": { Component: S14b },
  "home": { Component: Home },
};

/** Human names for the debug menu's Jump to screen list. */
export const SCREEN_NAMES: Record<ScreenId, string> = {
  "01": "Meet Tara", "02": "Create account", "02x": "Sign-in cancelled", "02b": "Sign in", "02c": "Welcome back",
  "03": "Name", "04": "Your kitchen", "05": "How you cook", "06": "Is Tara with you?",
  "07a": "Allow Bluetooth", "07b": "iOS Bluetooth prompt", "07c": "Bluetooth is off", "07": "Plug in Tara",
  "07h": "Nothing on the screen", "08": "Looking for Tara", "08x": "Can’t find Tara", "09": "Pair Tara",
  "09x": "Already set up", "10": "Wi-Fi", "10x": "Wrong password", "10b": "Updating Tara",
  "11": "Your stove", "12": "Attach the camera", "12h": "Hood sheet", "13": "Calibrating",
  "13p": "Tara offline", "13r": "Back online", "13s": "Calibrated", "13x": "Sees 3 of 4", "13y": "Sees 5, picked 4",
  "13n": "Turn on alerts", "14": "All set", "14b": "All set, first cook", "home": "Home",
};
