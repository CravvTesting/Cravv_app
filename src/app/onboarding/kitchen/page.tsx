"use client";

import { useRouter } from "next/navigation";
import { Actions, PrimaryButton, Screen, Subtitle, Title, TopBar } from "@/components/ui";
import { PChip, PSectionTitle, ScrollBody, type ChipIcon } from "@/components/personalise";
import { useHydrated, useOnboarding } from "@/lib/store";

type Opt = { label: string; icon: ChipIcon; color: string };

const DIET_GREEN = "#1F8638";
const DIETS: Opt[] = [
  { label: "Everything", icon: { src: "icon-utensils" }, color: DIET_GREEN },
  { label: "Vegetarian", icon: { src: "icon-leaf" }, color: DIET_GREEN },
  { label: "Vegan", icon: { src: "icon-sprout" }, color: DIET_GREEN },
  { label: "Pescatarian", icon: { src: "icon-fish-diet", w: 14.25, h: 8.25, inset: "27.08% 10.42%" }, color: DIET_GREEN },
  { label: "Gluten-free", icon: { src: "icon-wheat-diet", w: 7.8, h: 14.1, inset: "13.34% 28.33% 8.33% 28.33%" }, color: DIET_GREEN },
  { label: "Dairy-free", icon: { src: "icon-milk-diet", w: 9.3, h: 15, inset: "8.33% 24.17%" }, color: DIET_GREEN },
];

const AVOID = "#8F6C46";
const ALLERGIES: Opt[] = [
  { label: "Peanuts", icon: { src: "peanut" }, color: AVOID },
  { label: "Shellfish", icon: { src: "icon-shrimp", avoid: true }, color: AVOID },
  { label: "Wheat", icon: { src: "icon-wheat", avoid: true }, color: AVOID },
  { label: "Tree nuts", icon: { src: "icon-acorn", avoid: true }, color: AVOID },
  { label: "Eggs", icon: { src: "icon-egg", avoid: true }, color: AVOID },
  { label: "Milk", icon: { src: "icon-milk", avoid: true }, color: AVOID },
  { label: "Soy", icon: { src: "icon-soy", avoid: true }, color: AVOID },
  { label: "Fish", icon: { src: "icon-fish", avoid: true }, color: AVOID },
  { label: "Sesame", icon: { src: "icon-sesame", avoid: true }, color: AVOID },
  { label: "Other", icon: { src: "icon-plus", avoid: true }, color: AVOID },
];

// Italian, Mexican and Indian colours are from the design; the rest follow the same muted palette.
const CUISINES: Opt[] = [
  { label: "American", icon: { src: "icon-burger" }, color: "#3E6A9E" },
  { label: "Italian", icon: { src: "icon-pizza" }, color: "#B85840" },
  { label: "Mexican", icon: { src: "icon-taco" }, color: "#5B7D28" },
  { label: "Chinese", icon: { src: "icon-noodles" }, color: "#B0413E" },
  { label: "Mediterranean", icon: { src: "icon-olive" }, color: "#4E7A57" },
  { label: "Japanese", icon: { src: "icon-sushi" }, color: "#A4475E" },
  { label: "Thai", icon: { src: "icon-chili" }, color: "#2E8577" },
  { label: "Indian", icon: { src: "icon-bowl" }, color: "#A36606" },
];

/** 04 · Your kitchen */
export default function KitchenPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const diet = useOnboarding((s) => s.diet);
  const allergies = useOnboarding((s) => s.allergies);
  const cuisines = useOnboarding((s) => s.cuisines);
  const set = useOnboarding((s) => s.set);
  const toggle = useOnboarding((s) => s.toggle);

  const on = (list: string[], v: string) => hydrated && list.includes(v);

  return (
    <Screen className="h-dvh">
      <TopBar step={2} />
      <ScrollBody>
        <Title className="mt-1">Your kitchen</Title>
        <Subtitle className="mt-[5px]">Tara only suggests recipes that fit.</Subtitle>

        <PSectionTitle className="mt-[18px]">Diet</PSectionTitle>
        <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
          {DIETS.map((o) => (
            <PChip key={o.label} label={o.label} icon={o.icon} color={o.color} selected={hydrated && diet === o.label} onClick={() => set({ diet: o.label })} />
          ))}
        </div>

        <PSectionTitle
          className="mt-[26px]"
          right={
            <button
              type="button"
              aria-pressed={hydrated && allergies.length === 0}
              onClick={() => set({ allergies: [] })}
              className="text-[15px] font-semibold leading-[22px] text-accent transition active:opacity-60"
            >
              None
            </button>
          }
        >
          Allergies
        </PSectionTitle>
        <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
          {ALLERGIES.map((o) => (
            <PChip key={o.label} variant="wide" label={o.label} icon={o.icon} color={o.color} selected={on(allergies, o.label)} onClick={() => toggle("allergies", o.label)} />
          ))}
        </div>

        <PSectionTitle className="mt-[26px]">Cuisines</PSectionTitle>
        <div className="flex flex-wrap gap-x-1.5 gap-y-2.5 pb-2">
          {CUISINES.map((o) => (
            <PChip key={o.label} variant="wide" label={o.label} icon={o.icon} color={o.color} selected={on(cuisines, o.label)} onClick={() => toggle("cuisines", o.label)} />
          ))}
        </div>
      </ScrollBody>
      <Actions>
        <PrimaryButton onClick={() => router.push("/onboarding/cooking")}>Continue</PrimaryButton>
      </Actions>
    </Screen>
  );
}
