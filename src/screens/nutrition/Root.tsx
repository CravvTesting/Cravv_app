"use client";

/* R01 · R02 · R03 (one component): Nutrition Today / Week / Month. */
import type { ScreenId } from "@/proto/store";
import { NutritionRootView } from "./today-root";

export default function NutritionRoot({ id }: { id: ScreenId }) {
  return <NutritionRootView view={id === "R02" ? "week" : id === "R03" ? "month" : "today"} />;
}
