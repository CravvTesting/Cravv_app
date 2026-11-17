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
import Filters from "./home/Filters";
import N01 from "./nutrition/N01";
import N02 from "./nutrition/N02";
import N02b from "./nutrition/N02b";
import N03 from "./nutrition/N03";
import N04 from "./nutrition/N04";
import N05 from "./nutrition/N05";
import N05b from "./nutrition/N05b";
import N06 from "./nutrition/N06";
import NutritionRoot from "./nutrition/Root";
import R04 from "./nutrition/R04";
import R05 from "./nutrition/R05";
import R06 from "./nutrition/R06";
import R07 from "./nutrition/R07";
import R08 from "./nutrition/R08";
import R09 from "./nutrition/R09";
import JournalRoot from "./journal/Root";
import J02 from "./journal/J02";
import J03 from "./journal/J03";
import J04 from "./journal/J04";
import J07 from "./journal/J07";
import J08 from "./journal/J08";
import J09 from "./journal/J09";
import J12 from "./journal/J12";
import Instacart from "./journal/Instacart";
import ProfileRoot from "./profile/Root";
import P02 from "./profile/P02";
import P03 from "./profile/P03";
import P04 from "./profile/P04";
import P05 from "./profile/P05";
import PlaceholderScreen from "./PlaceholderScreen";

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

  // Home filter sheet (one sheet; F01 → F02 → F03 are its states)
  "F01": { Component: Filters, base: "home", group: "filters" },
  "F02": { Component: Filters, base: "home", group: "filters" },
  "F03": { Component: Filters, base: "home", group: "filters" },

  // Nutrition
  "N01": { Component: N01 },
  "N02": { Component: N02 },
  "N02b": { Component: N02b, base: "N02" },
  "N03": { Component: N03 },
  "N04": { Component: N04 },
  "N05": { Component: N05 },
  "N05b": { Component: N05b },
  "N06": { Component: N06 },
  "R01": { Component: NutritionRoot, group: "nutrition-root" },
  "R02": { Component: NutritionRoot, group: "nutrition-root" },
  "R03": { Component: NutritionRoot, group: "nutrition-root" },
  "R04": { Component: R04 },
  "R05": { Component: R05 },
  "R06": { Component: R06 },
  "R07": { Component: R07 },
  "R08": { Component: R08 },
  "R09": { Component: R09 },

  // Journal (Meal Log / Favourites / Grocery are one root with a segmented control)
  "J01": { Component: JournalRoot, group: "journal-root" },
  "J05": { Component: JournalRoot, group: "journal-root" },
  "J06": { Component: JournalRoot, group: "journal-root" },
  "J10": { Component: JournalRoot, group: "journal-root" },
  "J11": { Component: JournalRoot, group: "journal-root" },
  "J15": { Component: JournalRoot, group: "journal-root" },
  "J02": { Component: J02 },
  "J03": { Component: J03, base: "J01" },
  "J04": { Component: J04 },
  "J07": { Component: J07 },
  "J08": { Component: J08, base: "J07" },
  "J09": { Component: J09 },
  "J12": { Component: J12, base: "J11" },
  "J13": { Component: Instacart, group: "instacart" },
  "J14": { Component: Instacart, group: "instacart" },

  // Profile (P01b/P01c are states of the root)
  "P01": { Component: ProfileRoot, group: "profile-root" },
  "P01b": { Component: ProfileRoot, group: "profile-root" },
  "P01c": { Component: ProfileRoot, group: "profile-root" },
  "P02": { Component: P02 },
  "P03": { Component: P03 },
  "P04": { Component: P04 },
  "P05": { Component: P05, base: "P01" },
  // Onboarding 04 / 05 / 11 reused in edit mode (back button instead of step bar, Save)
  "e04": { Component: S04 },
  "e05": { Component: S05 },
  "e11": { Component: S11 },

  "placeholder": { Component: PlaceholderScreen },
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
  "F01": "Filters", "F02": "Filters · picked", "F03": "Filters · no matches",
  "N01": "Nutrition · first open", "N02": "About you", "N02b": "Height picker", "N03": "Activity", "N04": "Goal",
  "N05": "Your targets", "N05b": "How we worked it out", "N06": "Ready, no cooks",
  "R01": "Nutrition · Today", "R02": "Nutrition · Week", "R03": "Nutrition · Month", "R04": "Meal · Thai Green Curry",
  "R05": "Log dinner", "R06": "Search food", "R07": "Food detail", "R08": "Edit targets", "R09": "Sodium detail",
  "J01": "Meal Log", "J02": "Meal detail", "J03": "Log a meal", "J04": "Photo log", "J05": "Meal Log · empty",
  "J06": "Favourites", "J07": "Collection", "J08": "Save to collections", "J09": "New collection", "J10": "Favourites · empty",
  "J11": "Grocery", "J12": "Add ingredient", "J13": "Adding to Instacart", "J14": "Cart ready", "J15": "Grocery · empty",
  "P01": "Profile", "P01b": "Profile · Tara not set up", "P01c": "Profile · Tara offline", "P02": "Stove and camera",
  "P03": "Safety and alerts", "P04": "Camera and privacy", "P05": "Sign out?",
  "e04": "Food preferences (edit)", "e05": "How you cook (edit)", "e11": "Your stove (edit)",
  "placeholder": "Placeholder",
};
