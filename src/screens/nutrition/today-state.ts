"use client";

/*
 * Session-only UI state shared by the Nutrition screens (not persisted, not app data):
 * which slot R05 logs into, the R06 query, the R07 food and portion, the R04 meal, and the
 * id of a meal just added (R01 expands its row and animates the totals once).
 */
import { create } from "zustand";
import type { MealSlot } from "@/proto/seed/meals";

type TodayUI = {
  slot: MealSlot;
  query: string;
  foodId: string | null;
  portion: number;
  mealId: string | null;
  justAdded: string | null;
  /** R01's scroll offset when Log was tapped, so the sheet's underlay matches. */
  underScroll: number;
};

export const useTodayUI = create<TodayUI>(() => ({
  slot: "dinner",
  query: "pizza",
  foodId: "cheese-pizza",
  portion: 2,
  mealId: null,
  justAdded: null,
  underScroll: 0,
}));

export const setTodayUI = (p: Partial<TodayUI>) => useTodayUI.setState(p);
