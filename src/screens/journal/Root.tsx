"use client";

/*
 * Journal tab root (J01 Meal Log, J06 Favourites, J11 Grocery and their empty states J05, J10,
 * J15). One component: the segmented control swaps the route in place and the content
 * cross-fades with a 12px shift in the direction of travel (handoff §8.3).
 */
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { DayHeader, Icon, MealRow, PrimaryButton, SegmentedControl, SettingsChevron, SettingsGroup } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { go, switchTab, useNavState } from "@/proto/nav";
import { useProto, type ScreenId } from "@/proto/store";
import { LargeTitleScreen, MINI_BAR_SPACE } from "@/proto/ui";
import type { Meal } from "@/proto/seed/meals";
import { diary, dayLabel, groceryCount, mealDetail, mealPhoto, recipe, stepAmount, useJournalUi } from "./data";
import { useInstacart } from "./instacart";
import {
  Card, CheckBox, EmptyState, FAV, Glyph, Hairline, Mosaic, PressRow, RoundButton, SECONDARY, SectionLabel, Stepper, Thumb, tint,
} from "./parts";

type Seg = "log" | "fav" | "grocery";
const SEG_OF: Partial<Record<ScreenId, Seg>> = { J01: "log", J05: "log", J06: "fav", J10: "fav", J11: "grocery", J15: "grocery" };
const ORDER: Seg[] = ["log", "fav", "grocery"];
const OPTIONS = [
  { value: "log" as const, label: "Meal Log" },
  { value: "fav" as const, label: "Favourites" },
  { value: "grocery" as const, label: "Grocery" },
];
const EMPTY_ID: Record<Seg, ScreenId> = { log: "J05", fav: "J10", grocery: "J15" };
const FULL_ID: Record<Seg, ScreenId> = { log: "J01", fav: "J06", grocery: "J11" };

/** Which segments have nothing to show (debug flag or real data), so the empty state renders. */
function useEmpty() {
  const debug = useProto((s) => s.debug);
  const meals = useProto((s) => s.meals);
  const collections = useProto((s) => s.collections);
  const grocery = useProto((s) => s.grocery);
  return {
    log: debug.mealLog === "empty" || meals.length === 0,
    fav: debug.favourites === "empty" || collections.every((c) => c.recipeIds.length === 0),
    grocery: debug.groceryData === "empty" || grocery.every((l) => l.items.length === 0),
  } satisfies Record<Seg, boolean>;
}

export default function JournalRoot({ id }: { id: ScreenId }) {
  const seg = SEG_OF[id] ?? "log";
  const empties = useEmpty();
  const forcedEmpty = id === "J05" || id === "J10" || id === "J15";
  const empty = empties[seg] || forcedEmpty;
  const m = useMotionTokens();

  // Direction of travel for the content shift.
  const prev = useRef(seg);
  const dir = useRef(0);
  if (prev.current !== seg) {
    dir.current = Math.sign(ORDER.indexOf(seg) - ORDER.indexOf(prev.current));
    prev.current = seg;
  }

  const select = (s: Seg) => {
    if (s === seg) return;
    go(empties[s] ? EMPTY_ID[s] : FULL_ID[s], { replace: true, dir: "none" });
  };

  const right = empty ? <span aria-hidden className="size-11" /> : seg === "log" ? (
    <RoundButton label="Log a meal" onClick={() => go("J03")} />
  ) : seg === "fav" ? (
    <RoundButton label="New collection" onClick={() => go("J09")} />
  ) : (
    <RoundButton label="Add an item" onClick={() => { useJournalUi.getState().set({ dish: "Other" }); go("J12"); }} />
  );

  const shift = m.reduced ? 0 : 12;
  const t = { duration: 0.28 * m.scale, ease: [0.32, 0.72, 0, 1] as const };

  return (
    <>
    <LargeTitleScreen
      title="Journal"
      tabRoot
      right={right}
      below={<SegmentedControl label="Journal sections" options={OPTIONS} value={seg} onChange={select} />}
    >
      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout" custom={dir.current}>
          <motion.div
            key={`${seg}-${empty ? "e" : "f"}`}
            custom={dir.current}
            variants={{
              enter: (d: number) => ({ opacity: 0, transform: `translateX(${d * shift}px)` }),
              center: { opacity: 1, transform: "translateX(0px)" },
              exit: (d: number) => ({ opacity: 0, transform: `translateX(${-d * shift}px)` }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={t}
          >
            {seg === "log" && (empty ? <LogEmpty /> : <MealLog />)}
            {seg === "fav" && (empty ? <FavEmpty /> : <Favourites />)}
            {seg === "grocery" && (empty ? <GroceryEmpty /> : <Grocery />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </LargeTitleScreen>
    {seg === "grocery" && !empty && <OrderBar />}
    </>
  );
}

// ---------------------------------------------------------------------------
// J01 Meal Log
// ---------------------------------------------------------------------------

function mealRowType(m: Meal) {
  return m.source === "logged" || !mealPhoto(m) ? "logged" : "tara-cook";
}

function MealLog() {
  const meals = useProto((s) => s.meals);
  const justAdded = useJournalUi((s) => s.justAdded);
  const added = justAdded ? meals.find((x) => x.id === justAdded) : undefined;
  // The day total starts without the new meal and ticks up once the row has expanded.
  const [settled, setSettled] = useState(!added);
  useEffect(() => {
    if (!justAdded) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setSettled(true)); });
    const t = setTimeout(() => useJournalUi.getState().set({ justAdded: null }), 1500);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); clearTimeout(t); };
  }, [justAdded]);

  const open = (mealId: string) => {
    useJournalUi.getState().set({ mealId });
    go("J02");
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {diary(meals).map((d) => (
        <section key={d.day} aria-label={dayLabel(d.day)}>
          <DayHeader label={dayLabel(d.day)} kcal={added && added.day === d.day && !settled ? d.total - added.kcal : d.total} className="mb-1" />
          <SettingsGroup>
            {d.meals.map((meal) => {
              const row = (
                <MealRow
                  key={meal.id}
                  context="journal"
                  type={mealRowType(meal)}
                  name={meal.name}
                  detail={mealDetail(meal)}
                  kcal={meal.kcal}
                  photo={mealPhoto(meal)}
                  rating={meal.source === "tara" ? meal.rating ?? 0 : undefined}
                  onPress={() => open(meal.id)}
                />
              );
              return meal.id === justAdded ? (
                <ExpandIn key={meal.id} open={settled}>{row}</ExpandIn>
              ) : row;
            })}
          </SettingsGroup>
        </section>
      ))}
    </div>
  );
}

/** A row that expands in place once (grid-template-rows 0fr → 1fr, handoff §8.5). */
function ExpandIn({ open, children }: { open: boolean; children: ReactNode }) {
  const m = useMotionTokens();
  const d = 0.4 * m.scale;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: m.reduced ? "none" : `grid-template-rows ${d}s var(--ease-ios), opacity ${d}s ease`,
      }}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function LogEmpty() {
  return (
    <EmptyState
      icon={<Icon name="book" size={56} />}
      color="var(--cravv-option-tab-journal-base)"
      tint={tint("var(--cravv-option-tab-journal-base)", 14)}
      title="Your meals show up here"
      body="Cook with Tara and it’s logged for you. Add anything else in a tap."
      action="Log a Meal"
      onAction={() => go("J03")}
    />
  );
}

// ---------------------------------------------------------------------------
// J06 Favourites
// ---------------------------------------------------------------------------

function Favourites() {
  const collections = useProto((s) => s.collections);
  const all = collections.find((c) => c.id === "all");
  const grid = collections.filter((c) => c.id !== "all");
  const open = (collectionId: string) => {
    useJournalUi.getState().set({ collectionId });
    go("J07");
  };
  return (
    <div>
      <Card>
        <PressRow onClick={() => open("all")} className="h-[72px] px-4">
          <span className="flex size-11 items-center justify-center rounded-[12px]" style={{ background: tint(FAV, 16), color: FAV }}>
            <Icon name="heart" size={22} />
          </span>
          <span className="ml-3 flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[16px] font-semibold leading-[19px] text-white">All favourites</span>
            <span className="mt-[3px] text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
              {all?.recipeIds.length ?? 0} recipes
            </span>
          </span>
          <SettingsChevron size={14} />
        </PressRow>
      </Card>

      <SectionLabel className="mt-5">Collections</SectionLabel>
      <div className="grid grid-cols-2 gap-x-2 gap-y-3">
        {grid.map((c) => (
          <button key={c.id} type="button" onClick={() => open(c.id)} className="relative flex min-w-0 flex-col text-left transition-transform active:scale-[0.98]">
            <Mosaic recipeIds={c.recipeIds} radius={18} />
            {c.shared && (
              <span aria-label="Shared" className="absolute right-[10px] top-[10px] flex size-[26px] items-center justify-center rounded-full bg-black/55 text-white">
                <Icon name="users" size={16} />
              </span>
            )}
            <span className="mt-[9px] truncate px-0.5 text-[15px] font-semibold leading-5 text-white">{c.name}</span>
            <span className="px-0.5 text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
              {c.recipeIds.length} {c.recipeIds.length === 1 ? "recipe" : "recipes"}
              {c.shared ? " · shared" : ""}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go("J09")}
        className="mt-[18px] flex h-14 w-full items-center gap-[14px] rounded-[16px] border border-dashed border-white/25 px-[15px] text-[16px] text-white active:bg-white/[0.04]"
      >
        <Glyph name="plus" size={22} />
        New collection
      </button>
    </div>
  );
}

function FavEmpty() {
  return (
    <EmptyState
      icon={<Icon name="heart" size={56} />}
      color={FAV}
      tint={tint(FAV, 16)}
      title="Keep recipes you love"
      body="Tap the heart on any recipe. Group them into collections, like a playlist for dinner."
      action="Browse Recipes"
      onAction={() => switchTab("home")}
    />
  );
}

// ---------------------------------------------------------------------------
// J11 Grocery
// ---------------------------------------------------------------------------

function Grocery() {
  const grocery = useProto((s) => s.grocery);
  const setStore = useProto((s) => s.set);
  const update = (li: number, fn: (l: (typeof grocery)[number]) => (typeof grocery)[number]) =>
    setStore({ grocery: grocery.map((l, i) => (i === li ? fn(l) : l)) });

  return (
    <div>
      <p className="text-[14px] leading-[19px]" style={{ color: SECONDARY }}>
        Tick the lists to send to Instacart. Adjust amounts first if you need to.
      </p>
      <div className="mt-[14px] flex flex-col gap-3">
        {grocery.map((list, li) => {
          const photo = list.recipeId ? recipe(list.recipeId).photo : undefined;
          const left = list.items.filter((i) => !i.have).length;
          const selected = list.selected ?? true;
          return (
            <Card key={list.dish}>
              <div className="flex h-16 items-center px-4">
                <CheckBox on={selected} label={`Send ${list.dish} to Instacart`} onChange={(v) => update(li, (l) => ({ ...l, selected: v }))} />
                {photo && <Thumb src={photo} size={36} radius={10} className="ml-[10px]" />}
                <span className="ml-[10px] flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[16px] font-semibold leading-[19px] text-white">{list.dish}</span>
                  <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
                    {[list.source, `${left} ${left === 1 ? "item" : "items"}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </div>
              {list.items.map((item, ii) => (
                <div key={`${item.name}-${ii}`} className="relative flex h-12 items-center pl-4 pr-4">
                  <Hairline inset={16} right={16} />
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={item.have}
                    aria-label={`I have ${item.name}`}
                    onClick={() => update(li, (l) => ({ ...l, items: l.items.map((x, k) => (k === ii ? { ...x, have: !x.have } : x)) }))}
                    className="flex h-full min-w-0 flex-1 items-center gap-2 text-left text-[15px] text-white"
                  >
                    <span className="truncate" style={{ opacity: item.have ? 0.4 : 1, textDecoration: item.have ? "line-through" : undefined, transition: "opacity 0.2s ease" }}>
                      {item.name}
                    </span>
                    {item.have && <span className="shrink-0 text-[12px]" style={{ color: SECONDARY }}>Have it</span>}
                  </button>
                  <Stepper
                    label={item.name}
                    value={item.amount}
                    onMinus={() => update(li, (l) => ({ ...l, items: l.items.map((x, k) => (k === ii ? { ...x, amount: stepAmount(x.amount, -1) } : x)) }))}
                    onPlus={() => update(li, (l) => ({ ...l, items: l.items.map((x, k) => (k === ii ? { ...x, amount: stepAmount(x.amount, 1) } : x)) }))}
                  />
                </div>
              ))}
              <div className="relative">
                <Hairline inset={16} right={16} />
                <button
                  type="button"
                  onClick={() => { useJournalUi.getState().set({ dish: list.dish }); go("J12"); }}
                  className="flex h-11 w-full items-center gap-1.5 px-4 text-[15px] font-semibold active:opacity-50"
                  style={{ color: "var(--cravv-text-accent)" }}
                >
                  <Glyph name="plus" size={18} />
                  Add ingredient
                </button>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Room for the order bar pinned above the tab bar. */}
      <div aria-hidden className="h-[104px]" />
    </div>
  );
}

/** "2 lists · 5 items" + Add to Instacart, pinned above the tab bar (frame J11 Order bar). */
function OrderBar() {
  // The shell's scroll fade (z 70) sits above every page layer, and the frame draws this bar
  // above it, so the bar is portalled next to the layers. It only shows on J11 (and under the
  // J12 sheet), fading in, so it never floats over a sliding page.
  const anchor = useRef<HTMLSpanElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const navId = useNavState((s) => s.id);
  useEffect(() => { setHost(anchor.current?.closest<HTMLElement>("[data-layer]")?.parentElement ?? null); }, []);
  const visible = navId === "J11" || navId === "J12";
  return (
    <>
      <span ref={anchor} hidden />
      {host && visible && createPortal(<OrderBarInner />, host)}
    </>
  );
}

function OrderBarInner() {
  const m = useMotionTokens();
  const grocery = useProto((s) => s.grocery);
  const live = useProto((s) => s.live);
  const job = useInstacart();
  const { lists, items } = groceryCount(grocery);
  const running = job.status === "running";
  const done = job.status === "done";

  const send = () => {
    if (running) return go("J13");
    if (done) return go("J14");
    const cart = grocery
      .filter((l) => (l.selected ?? true))
      .flatMap((l) => l.items.filter((i) => !i.have).map((i) => ({ dish: l.dish, name: i.name, amount: i.amount })));
    job.start(cart);
    go("J13");
  };

  return (
    <div
      className="absolute inset-x-0 z-[71] mx-auto max-w-[440px] px-5 pb-3 pt-2.5"
      style={{
        animation: m.reduced ? undefined : `cravv-fade-in ${0.25 * m.scale}s ease ${0.3 * m.scale}s both`,
        bottom: `calc(64px + 12px + max(env(safe-area-inset-bottom), 12px) + ${live ? MINI_BAR_SPACE : "0px"})`,
        background: "var(--cravv-bg-page)",
      }}
    >
      <p className="mb-2 text-[13px] font-semibold leading-4" style={{ color: SECONDARY }}>
        {running ? `Adding to Instacart · ${job.done} of ${job.items.length}` : done ? "Your cart is ready" : `${lists} ${lists === 1 ? "list" : "lists"} · ${items} ${items === 1 ? "item" : "items"}`}
      </p>
      <PrimaryButton onClick={send} disabled={!running && !done && items === 0}>
        {running ? "See Progress" : done ? "See Your Cart" : `Add ${items} ${items === 1 ? "Item" : "Items"} to Instacart`}
      </PrimaryButton>
    </div>
  );
}

function GroceryEmpty() {
  return (
    <EmptyState
      icon={<Icon name="cart" size={56} />}
      color="var(--cravv-status-success)"
      tint={tint("var(--cravv-status-success)", 14)}
      title="Nothing to buy yet"
      body="Add missing ingredients from any recipe and they’re grouped by dish here."
      action="Add an Item"
      link
      onAction={() => { useJournalUi.getState().set({ dish: "Other" }); go("J12"); }}
    />
  );
}

