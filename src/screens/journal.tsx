"use client";

/*
 * Journal tab (Figma 2568:4383, "Journal (while cooking)"). Cooked / Plan segmented control.
 * Cooked: this week's cooks and the "Coming up" group, as in the frame. Plan: no frame exists, so
 * a modest next-7-days list in the same visual language (planned meals or "Add a meal").
 * The cooking mini bar sits fixed just above the tab bar. Rows press but don't navigate.
 */
import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/cravv";
import { CookingMiniBar, MINI_BAR_SPACE } from "./tabs/CookingMiniBar";
import { Chevron, Glyph, Group, MealRow, Row, Section, TabScreen, Thumb } from "./tabs/ui";

type View = "cooked" | "plan";
const VIEWS = [
  { value: "cooked", label: "Cooked" },
  { value: "plan", label: "Plan" },
] as const;

const ORANGE = "var(--cravv-orange-500)";

/** "Add a meal" action in copper, the accent for links. */
function AddMeal() {
  return <span className="ml-3 shrink-0 text-[15px] font-semibold leading-[18px] text-accent">Add a meal</span>;
}

function GroceryRow() {
  return (
    <Row height={68} sepInset={52} className="pl-4 pr-[14px]" label="Grocery list, 7 items, order on Instacart">
      <Glyph name="cart" />
      <span className="ml-[14px] flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[17px] leading-[20px] tracking-[-0.43px] text-white">Grocery list</span>
        <span className="mt-[3px] truncate text-[13px] leading-[16px] text-secondary">7 items · Order on Instacart</span>
      </span>
      <Chevron className="ml-3" />
    </Row>
  );
}

function Cooked() {
  return (
    <>
      <Section>This week</Section>
      <Group label="Cooked this week">
        <MealRow lead={<Thumb src="rajma" />} title="Rajma Chawal" subtitle="Today · cooking now" subtitleColor={ORANGE} />
        <MealRow lead={<Thumb src="tacos" />} title="Black Bean Tacos" subtitle="Wed · ★★★★★ · “Less chilli next time”" />
        <MealRow
          lead={
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.06]">
              <Glyph name="eye-24" size={24} />
            </span>
          }
          title="Pressure cooker"
          subtitle="Tue · watched · 3 whistles"
        />
        <MealRow lead={<Thumb src="spaghetti" />} title="Spaghetti Pomodoro" subtitle="Sun · ★★★★" />
      </Group>

      <Section>Coming up</Section>
      <Group label="Coming up">
        <Row height={52} sepInset={16} className="pl-4 pr-4" label="Tomorrow, add a meal">
          <span className="min-w-0 flex-1 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-white">Tomorrow</span>
          <AddMeal />
        </Row>
        <GroceryRow />
      </Group>
    </>
  );
}

/** Planned meals by offset from today (1 = tomorrow). Others show "Add a meal". */
const PLANNED: Record<number, { img: string; title: string; note: string }> = {
  2: { img: "tacos", title: "Black Bean Tacos", note: "Dinner · 2 servings" },
  4: { img: "spaghetti", title: "Spaghetti Pomodoro", note: "Dinner · 2 servings" },
  6: { img: "rajma", title: "Rajma Chawal", note: "Lunch · 4 servings" },
};

function Plan() {
  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const off = i + 1;
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + off);
      const label = off === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "long" });
      const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { off, label, date };
    });
  }, []);

  return (
    <>
      <Section>Next 7 days</Section>
      <Group label="Next 7 days">
        {days.map((d) => {
          const meal = PLANNED[d.off];
          return meal ? (
            <MealRow key={d.off} lead={<Thumb src={meal.img} />} title={meal.title} subtitle={`${d.label} · ${meal.note}`} chevron />
          ) : (
            <Row key={d.off} height={52} sepInset={16} className="pl-4 pr-4" label={`${d.label}, add a meal`}>
              <span className="min-w-0 flex-1 truncate text-[17px] leading-[22px] tracking-[-0.43px] text-white">
                {d.label} <span className="text-secondary">· {d.date}</span>
              </span>
              <AddMeal />
            </Row>
          );
        })}
      </Group>

      <Section>Shopping</Section>
      <Group label="Shopping">
        <GroceryRow />
      </Group>
    </>
  );
}

export default function Journal() {
  const [view, setView] = useState<View>("cooked");
  return (
    <TabScreen title="Journal" overlay={<CookingMiniBar />} extraBottom={MINI_BAR_SPACE}>
      <div className="mt-[9px] flex h-[34px] items-center">
        <SegmentedControl options={VIEWS} value={view} onChange={setView} label="Journal view" />
      </div>
      {view === "cooked" ? <Cooked /> : <Plan />}
    </TabScreen>
  );
}
