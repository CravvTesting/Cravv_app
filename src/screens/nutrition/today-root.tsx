"use client";

/*
 * R01 · R02 · R03: Nutrition Today / Week / Month. One Large Title screen; the segmented
 * control swaps the route in place (go(id, { replace: true, dir: "none" })) and the content
 * cross-fades with a 12px shift in the direction of travel (handoff §8.3).
 * Every number derives from the store: meals, targets, watching (and debug.overLimit).
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Icon,
  MacroRingCard,
  MealRow,
  NUTRIENTS,
  NutrientRow,
  PRESS,
  SectionTitle,
  SegmentedControl,
  TargetsRow,
  TipNote,
  cx,
  formatNumber,
  type NutrientId,
} from "@/components/cravv";
import { MOTION, useMotionTokens } from "@/proto/motion";
import { go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import {
  LIMITS,
  SLOTS,
  TODAY,
  addDays,
  byTime,
  dayOfMonth,
  dayOfWeek,
  daysInMonth,
  isCook,
  lastDays,
  longDate,
  mealDetail,
  mealsOn,
  monthName,
  monthYear,
  photoOf,
  targetOf,
  todayTotals,
  totalsOf,
  valueOf,
  weekdayLetter,
  type Meal,
  type MealSlot,
} from "./today-data";
import { setTodayUI, useTodayUI } from "./today-state";
import { Card, ICON_OFF, SECONDARY, TERTIARY } from "./today-ui";

export type NutritionView = "today" | "week" | "month";
const ORDER: NutritionView[] = ["today", "week", "month"];
const ROUTE: Record<NutritionView, "R01" | "R02" | "R03"> = { today: "R01", week: "R02", month: "R03" };
const SEGMENTS = [
  { value: "today" as const, label: "Today" },
  { value: "week" as const, label: "Week" },
  { value: "month" as const, label: "Month" },
];

/** Keyframes for the segment cross-fade and the "meal added" row (transform/opacity, plus one grid-rows expand). */
const KEYFRAMES = `
@keyframes todaySegIn { from { opacity: 0; transform: translate3d(var(--today-shift), 0, 0); } to { opacity: 1; transform: none; } }
@keyframes todaySegOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate3d(var(--today-shift), 0, 0); } }
@keyframes todayRowIn { from { grid-template-rows: 0fr; opacity: 0; } to { grid-template-rows: 1fr; opacity: 1; } }
@keyframes todayRowOut { from { grid-template-rows: 1fr; opacity: 1; } to { grid-template-rows: 0fr; opacity: 0; } }
@keyframes todayFadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

/* ── Root ──────────────────────────────────────────────────────────────── */

export function NutritionRootView({ view, inert = false }: { view: NutritionView; inert?: boolean }) {
  const m = useMotionTokens();
  const [stage, setStage] = useState<{ cur: NutritionView; prev: NutritionView | null; dir: 1 | -1; key: number }>({ cur: view, prev: null, dir: 1, key: 0 });
  if (stage.cur !== view) {
    setStage((s) => ({ cur: view, prev: m.reduced ? null : s.cur, dir: ORDER.indexOf(view) > ORDER.indexOf(s.cur) ? 1 : -1, key: s.key + 1 }));
  }
  const dur = 0.28 * m.scale;
  useEffect(() => {
    if (!stage.prev) return;
    const t = setTimeout(() => setStage((s) => ({ ...s, prev: null })), dur * 1000 + 60);
    return () => clearTimeout(t);
  }, [stage.key, stage.prev, dur]);

  const subtitle = view === "today" ? longDate(TODAY) : view === "week" ? "Last 7 days" : monthName(TODAY);
  const body = (v: NutritionView) => (v === "today" ? <TodayView inert={inert} /> : v === "week" ? <WeekView /> : <MonthView />);
  const anim = (name: string, shift: number): CSSProperties =>
    ({ "--today-shift": `${shift}px`, animation: `${name} ${dur}s var(--ease-ios) both` }) as CSSProperties;

  return (
    <LargeTitleScreen
      title="Nutrition"
      tabRoot
      subtitle={subtitle}
      below={
        <SegmentedControl
          label="Nutrition period"
          options={SEGMENTS}
          value={view}
          onChange={(v) => !inert && go(ROUTE[v], { replace: true, dir: "none" })}
        />
      }
    >
      <style>{KEYFRAMES}</style>
      <div className="relative">
        {stage.prev && (
          <div key={`p${stage.key}`} aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={anim("todaySegOut", -12 * stage.dir)}>
            {body(stage.prev)}
          </div>
        )}
        <div key={`c${stage.key}`} style={stage.key > 0 && !m.reduced ? anim("todaySegIn", 12 * stage.dir) : undefined}>
          {body(stage.cur)}
        </div>
      </div>
    </LargeTitleScreen>
  );
}

/* ── Today (R01) ───────────────────────────────────────────────────────── */

type Phase = "before" | "expanding" | "done";

function TodayView({ inert }: { inert: boolean }) {
  const meals = useProto((s) => s.meals);
  const targets = useProto((s) => s.targets);
  const watching = useProto((s) => s.watching);
  const overLimit = useProto((s) => s.debug.overLimit);
  const justAdded = useTodayUI((s) => s.justAdded);
  const m = useMotionTokens();

  // A meal was just added (R05/R07): show the day without it, then expand its row in place,
  // then let the ring and "kcal left" animate to the new totals.
  const [phase, setPhase] = useState<Phase>(() => (justAdded && !m.reduced ? "before" : "done"));
  const [totalsIn, setTotalsIn] = useState(() => !justAdded || m.reduced);
  const added = useRef(justAdded);
  useEffect(() => {
    if (inert || !added.current) return;
    if (m.reduced) { setTodayUI({ justAdded: null }); return; }
    const s = m.scale;
    const t1 = setTimeout(() => setPhase("expanding"), (MOTION.pageMs + 40) * s);
    const t2 = setTimeout(() => setPhase("done"), (MOTION.pageMs + 40 + 450) * s);
    const t3 = setTimeout(() => { setTotalsIn(true); setTodayUI({ justAdded: null }); }, 1550 * s);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inert, m.reduced, m.scale]);

  const hideId = inert ? justAdded : added.current;
  const today = mealsOn(meals, TODAY);
  const listed = (inert || phase === "before") && hideId ? today.filter((x) => x.id !== hideId) : today;
  const forTotals = (!totalsIn || inert) && hideId ? meals.filter((x) => x.id !== hideId) : meals;
  const t = todayTotals(forTotals, overLimit);

  const watched = NUTRIENTS.filter((n) => watching.includes(n.id as never)).map((n) => n.id as NutrientId);
  const alsoInView = (["added-sugar", "saturated-fat", "fiber", "sodium"] as const).filter((id) => !watched.includes(id)).slice(0, 2);

  const openLog = (slot: MealSlot) => {
    if (inert) return;
    setTodayUI({ slot });
    go("R05", { dir: "instant" });
  };

  return (
    <div className="flex flex-col">
      <MacroRingCard
        kcalTarget={targets.kcal}
        kcalEaten={t.kcal}
        macros={{
          protein: { value: t.protein, target: targets.protein },
          carbs: { value: t.carbs, target: targets.carbs },
          fat: { value: t.fat, target: targets.fat },
        }}
      />

      {watched.length > 0 && (
        <>
          <SectionTitle className="mt-4">You’re watching</SectionTitle>
          <div className="overflow-hidden rounded-[16px]">
            {watched.map((id, i) => {
              const row = <NutrientRow nutrient={id} value={valueOf(t, id)} target={targetOf(id, targets)} separator={i > 0} status={id === "added-sugar" ? sugarStatus(t.sugarMaxMeal) : undefined} label={id === "added-sugar" ? "Added sugar (top meal)" : undefined} />;
              return id === "sodium" ? (
                <button key={id} type="button" className={cx("relative block w-full text-left", PRESS)} onClick={() => !inert && go("R09")} aria-label="Sodium details">
                  {row}
                </button>
              ) : (
                <div key={id}>{row}</div>
              );
            })}
          </div>
        </>
      )}

      {alsoInView.length > 0 && (
        <Card className={cx("flex h-[60px] items-stretch", watched.length > 0 ? "mt-3" : "mt-4")}>
          {alsoInView.map((id, i) => {
            const n = NUTRIENTS.find((x) => x.id === id)!;
            const v = valueOf(t, id);
            const lim = LIMITS[id];
            const over = id === "fiber" ? false : v > lim;
            const status =
              id === "added-sugar" ? sugarStatus(t.sugarMaxMeal)
                : id === "fiber" ? (v >= lim ? "Target met" : `${formatNumber(v)} / ${lim} g`)
                  : over ? `${formatNumber(v)} / ${formatNumber(lim)} ${n.unit} · over` : "On track";
            const button = id === "sodium";
            const Cell = button ? "button" : "div";
            return (
              <Cell
                key={id}
                {...(button ? { type: "button" as const, onClick: () => !inert && go("R09") } : {})}
                className={cx("relative flex min-w-0 flex-1 items-center text-left", button && PRESS)}
              >
                {i > 0 && <span aria-hidden className="absolute left-0 top-3 h-9 w-px origin-left scale-x-50 bg-white/[0.12]" />}
                <span className="ml-4 shrink-0" style={{ color: ICON_OFF }}><Icon name={n.icon} size={20} /></span>
                <span className="ml-2 flex min-w-0 flex-col pr-2">
                  <span className="truncate text-[14px] leading-[17px] text-white">{n.label}</span>
                  <span className={cx("mt-0.5 truncate text-[12px] leading-[14px]", over && "font-semibold")} style={{ color: over ? "var(--cravv-status-warning)" : SECONDARY }}>
                    {status}
                  </span>
                </span>
              </Cell>
            );
          })}
        </Card>
      )}

      <SectionTitle className="mt-4">Today’s meals</SectionTitle>
      <MealsList meals={listed} phase={phase} newId={hideId} inert={inert} onLog={openLog} />

      {t.fiber < LIMITS.fiber && (
        <TipNote className="mt-3" linkLabel="See Recipe" onLink={() => !inert && go("placeholder")}>
          Fiber is low today. Black Bean Tacos add 14 g if you cook them tonight.
        </TipNote>
      )}

      <TargetsRow className="mt-3" value={`${formatNumber(targets.kcal)} kcal`} onPress={() => !inert && go("R08")} />
    </div>
  );
}

const sugarStatus = (maxMeal: number) => (maxMeal <= LIMITS["added-sugar"] ? "On track" : `${maxMeal} g in one meal`);

function MealsList({
  meals,
  phase,
  newId,
  inert,
  onLog,
}: {
  meals: Meal[];
  phase: Phase;
  newId: string | null;
  inert: boolean;
  onLog: (slot: MealSlot) => void;
}) {
  const m = useMotionTokens();
  const dur = 0.42 * m.scale;
  const rows: ReactNode[] = [];
  const newMeal = newId ? meals.find((x) => x.id === newId) : undefined;
  SLOTS.forEach(({ id: slot, label }) => {
    const inSlot = meals.filter((x) => x.slot === slot).sort(byTime);
    // While the new meal expands, its slot's "Not logged" row collapses in the same place.
    const leaving = phase === "expanding" && newMeal?.slot === slot && inSlot.length === 1;
    if (inSlot.length === 0 || leaving) {
      rows.push(
        <Collapse key={`log-${slot}`} anim={leaving ? `todayRowOut ${dur}s var(--ease-ios) both` : undefined}>
          <MealRow
            context="nutrition"
            type="not-logged"
            slot={label}
            detail={slot === "dinner" ? "Cooking tonight? Tara logs it for you." : "Tap Log to add it."}
            onLog={() => onLog(slot)}
            separator={rows.length > 0}
          />
        </Collapse>
      );
    }
    for (const meal of inSlot) {
      const isNew = phase === "expanding" && meal.id === newId;
      rows.push(
        <Collapse key={meal.id} anim={isNew ? `todayRowIn ${dur}s var(--ease-ios) both` : undefined}>
          <MealRow
            context="nutrition"
            type={isCook(meal) ? "tara-cook" : "logged"}
            slot={label}
            name={meal.name}
            detail={mealDetail(meal)}
            kcal={meal.kcal}
            photo={isCook(meal) ? photoOf(meal) : undefined}
            onPress={inert ? undefined : () => { setTodayUI({ mealId: meal.id }); go("R04"); }}
            separator={rows.length > 0}
          />
        </Collapse>
      );
    }
  });
  return (
    <div
      className="overflow-hidden rounded-[16px]"
      style={{ background: "var(--cravv-surface-raised)" }}
      onClickCapture={(e) => {
        // The Log pill: remember the scroll before navigating.
        const el = e.target as HTMLElement;
        if (el.getAttribute("role") === "button" || el.closest("[role=button]")) {
          const sc = el.closest(".overflow-y-auto") as HTMLElement | null;
          setTodayUI({ underScroll: sc?.scrollTop ?? 0 });
        }
      }}
    >
      {rows}
    </div>
  );
}

/** Row wrapper that can expand/collapse in place once (grid rows 0fr ↔ 1fr). */
function Collapse({ children, anim }: { children: ReactNode; anim?: string }) {
  return (
    <div className="grid" style={anim ? { animation: anim } : undefined}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/* ── Week (R02) ────────────────────────────────────────────────────────── */

const BAR_SCALE = 76 / 1900; // px per kcal (frame: target line 76px above the baseline)

function WeekView() {
  const meals = useProto((s) => s.meals);
  const targets = useProto((s) => s.targets);
  const watching = useProto((s) => s.watching);
  const m = useMotionTokens();
  const [shown, setShown] = useState(m.reduced);
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, []);

  const days = lastDays(7);
  const full = days.slice(0, -1); // today so far is excluded from averages
  const perDay = days.map((d) => ({ day: d, meals: mealsOn(meals, d), t: totalsOf(mealsOn(meals, d)) }));
  const fullStats = perDay.slice(0, -1);
  const avg = (f: (t: ReturnType<typeof totalsOf>) => number) => Math.round(fullStats.reduce((s, x) => s + f(x.t), 0) / full.length);
  const avgKcal = avg((t) => t.kcal);
  const cooks = perDay.flatMap((x) => x.meals.filter(isCook));

  const rows: NutrientId[] = (["fiber", "protein", "sodium", "added-sugar", "saturated-fat"] as NutrientId[]).filter(
    (id) => id === "protein" || watching.includes(id as never)
  );
  const scaleMax = Math.max(targets.kcal * 1.3, ...perDay.map((x) => x.t.kcal));
  const k = Math.min(BAR_SCALE, 100 / scaleMax);

  return (
    <div className="flex flex-col">
      <div className="relative h-[224px] rounded-[24px] px-4" style={{ background: "var(--cravv-surface-raised)" }}>
        <p className="pt-4 text-[11px] font-semibold uppercase leading-[13px]" style={{ color: SECONDARY }}>Daily average</p>
        <p className="mt-[3px] flex items-baseline gap-3">
          <span className="text-[34px] font-bold leading-[41px] tabular-nums text-white">{formatNumber(avgKcal)}</span>
          <span className="text-[13px] leading-4" style={{ color: SECONDARY }}>kcal · target {formatNumber(targets.kcal)}</span>
        </p>
        <div className="absolute inset-x-4 bottom-7 top-[96px]">
          {/* target line */}
          <div aria-hidden className="absolute inset-x-0 h-px bg-white/[0.17]" style={{ bottom: targets.kcal * k }} />
          <span className="absolute right-0 text-[10px] leading-3" style={{ bottom: targets.kcal * k + 4, color: SECONDARY }}>{formatNumber(targets.kcal)}</span>
          <div className="absolute inset-0 flex items-end justify-between px-[10px]">
            {perDay.map((x, i) => {
              const isToday = x.day === TODAY;
              return (
                <div key={x.day} className="relative flex w-[22px] flex-col items-center">
                  <div
                    className="w-[22px] origin-bottom rounded-[6px]"
                    style={{
                      height: Math.max(4, x.t.kcal * k),
                      background: isToday ? "rgb(255 255 255 / 0.3)" : "rgb(255 255 255 / 0.85)",
                      transform: shown ? "scaleY(1)" : "scaleY(0)",
                      transition: m.reduced ? "none" : `transform ${0.6 * m.scale}s var(--ease-ios) ${i * 0.04 * m.scale}s`,
                    }}
                    title={`${formatNumber(x.t.kcal)} kcal`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute inset-x-4 bottom-0 flex justify-between px-[10px]">
          {perDay.map((x) => (
            <div key={x.day} className="relative flex h-7 w-[22px] flex-col items-center">
              <span className="mt-1.5 text-[11px] leading-[13px]" style={{ color: SECONDARY }}>{weekdayLetter(x.day)}</span>
              {x.meals.some(isCook) && <span aria-label="Cooked with Tara" className="mt-[3px] size-[5px] rounded-full bg-white" />}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1.5 flex items-center gap-[7px] px-4 text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
        <span aria-hidden className="size-[5px] rounded-full bg-white" />
        Cooked with Tara <span aria-hidden className="mx-1">·</span> Today so far is the faint bar
      </p>

      <div className="mt-[14px] overflow-hidden rounded-[16px]">
        {rows.map((id, i) => {
          const n = NUTRIENTS.find((x) => x.id === id)!;
          const target = targetOf(id, targets);
          const values = fullStats.map((x) => valueOf(x.t, id));
          const v = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
          const isLimit = n.kind === "limit";
          const miss = values.filter((x) => (isLimit ? x > target : x < target)).length;
          const status = isLimit
            ? miss > 0 ? `Over the limit on ${miss} of ${values.length} days` : "Under the limit every day"
            : v >= target ? "On target" : v >= target * 0.9 ? "Close to target" : `Short on ${miss} of ${values.length} days`;
          return (
            <NutrientRow key={id} nutrient={id} value={v} target={target} separator={i > 0} status={status} className={isLimit && miss > 0 ? "[&>span:last-child]:font-semibold" : undefined} />
          );
        })}
      </div>

      {cooks.length > 0 && (
        <button
          type="button"
          onClick={() => go("J01")}
          className={cx("relative mt-[26px] flex h-[60px] w-full items-center rounded-[16px] text-left", PRESS)}
          style={{ background: "var(--cravv-surface-raised)" }}
        >
          <span className="ml-4 flex shrink-0">
            {cooks.slice(0, 4).map((c, i) => (
              <span key={c.id} className="size-8 overflow-hidden rounded-full border-2" style={{ marginLeft: i ? -10 : 0, borderColor: "var(--cravv-surface-raised)", background: "var(--cravv-surface-secondary)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photoOf(c) && <img src={photoOf(c)} alt="" className="size-full object-cover" />}
              </span>
            ))}
          </span>
          <span className="ml-2 flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[16px] font-semibold leading-[19px] text-white">
              {cooks.length} {cooks.length === 1 ? "cook" : "cooks"} with Tara
            </span>
            <span className="mt-0.5 truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>Exact nutrition from the recipe</span>
          </span>
          <span className="mr-4 ml-2 shrink-0" style={{ color: ICON_OFF }}><Icon name="chevron" size={14} /></span>
        </button>
      )}
    </div>
  );
}

/* ── Month (R03) ───────────────────────────────────────────────────────── */

const RING = 32;
const RSW = 3;
const RR = (RING - RSW) / 2;
const RC = 2 * Math.PI * RR;

function DayRing({ frac, color }: { frac: number; color: string }) {
  return (
    <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} aria-hidden className="absolute inset-0">
      <circle cx={RING / 2} cy={RING / 2} r={RR} fill="none" stroke="white" strokeOpacity={0.12} strokeWidth={RSW} />
      <circle
        cx={RING / 2}
        cy={RING / 2}
        r={RR}
        fill="none"
        stroke={color}
        strokeWidth={RSW}
        strokeLinecap="round"
        strokeDasharray={`${RC * Math.min(1, frac)} ${RC}`}
        transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
      />
    </svg>
  );
}

function MonthView() {
  const meals = useProto((s) => s.meals);
  const targets = useProto((s) => s.targets);
  const m = useMotionTokens();
  const first = `${TODAY.slice(0, 8)}01`;
  const count = daysInMonth(TODAY);
  const lead = dayOfWeek(first);
  const todayNum = dayOfMonth(TODAY);

  const cells = Array.from({ length: count }, (_, i) => {
    const day = addDays(first, i);
    const ms = mealsOn(meals, day);
    const t = totalsOf(ms);
    return { day, num: i + 1, has: ms.length > 0, kcal: t.kcal, sodium: t.sodium, cook: ms.some(isCook) };
  });
  const past = cells.filter((c) => c.num < todayNum && c.has);
  const onTarget = past.filter((c) => Math.abs(c.kcal - targets.kcal) <= targets.kcal * 0.1).length;
  const cooks = cells.filter((c) => c.num <= todayNum).reduce((s, c) => s + mealsOn(meals, c.day).filter(isCook).length, 0);
  const avgSodium = past.length ? Math.round(past.reduce((s, c) => s + c.sodium, 0) / past.length) : 0;
  const sodiumOver = avgSodium > LIMITS.sodium;

  return (
    <div className="flex flex-col">
      <div className="rounded-[24px] px-4 pb-4" style={{ background: "var(--cravv-surface-raised)" }}>
        <div className="flex h-[52px] items-center justify-between pt-1">
          <p className="text-[17px] font-semibold leading-[22px] text-white">{monthYear(TODAY)}</p>
          <span aria-hidden className="flex gap-2" style={{ color: ICON_OFF }}>
            <span className="rotate-180"><Icon name="chevron" size={20} /></span>
            <Icon name="chevron" size={20} />
          </span>
        </div>
        <div className="grid grid-cols-7">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="pb-2 text-center text-[11px] font-semibold leading-[13px]" style={{ color: TERTIARY }}>{d}</span>
          ))}
          {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
          {cells.map((c, i) => {
            const isToday = c.num === todayNum;
            const future = c.num > todayNum;
            const within = Math.abs(c.kcal - targets.kcal) <= targets.kcal * 0.1;
            const color = isToday ? "var(--cravv-text-primary)" : within ? "var(--cravv-status-success)" : "var(--cravv-status-warning)";
            return (
              <div key={c.day} className="flex h-[46px] flex-col items-center" aria-label={`${c.num}${c.has && !future ? `, ${formatNumber(c.kcal)} kcal${c.cook ? ", cooked with Tara" : ""}` : ""}`}>
                <span
                  className="relative flex size-8 items-center justify-center"
                  style={m.reduced || future ? undefined : { animation: `todayFadeIn ${0.4 * m.scale}s ease ${i * 0.012 * m.scale}s both` }}
                >
                  {c.has && !future && <DayRing frac={c.kcal / targets.kcal} color={color} />}
                  <span
                    className={cx("relative text-[11px] leading-[13px] tabular-nums", isToday ? "font-bold" : future ? "font-normal" : "font-semibold")}
                    style={{ color: future ? "rgb(235 235 245 / 0.35)" : "var(--cravv-text-primary)" }}
                  >
                    {c.num}
                  </span>
                </span>
                {c.cook && !future && <span aria-hidden className="mt-[3px] size-1 rounded-full bg-white" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-1.5 px-4 text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ background: "var(--cravv-status-success)" }} />Within 10% of target</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full" style={{ background: "var(--cravv-status-warning)" }} />Off target</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="ml-px mr-px size-[5px] rounded-full bg-white" />Cooked with Tara</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Stat value={`${onTarget} of ${past.length}`} label="days on target" />
        <Stat value={String(cooks)} label="cooks with Tara" />
        <Stat value={`${formatNumber(avgSodium)} mg`} label={sodiumOver ? "avg sodium · over" : "avg sodium"} warn={sodiumOver} />
      </div>
    </div>
  );
}

function Stat({ value, label, warn = false }: { value: string; label: string; warn?: boolean }) {
  return (
    <div className="h-[84px] rounded-[16px] px-3 pt-3.5" style={{ background: "var(--cravv-surface-raised)" }}>
      <p className="whitespace-nowrap text-[20px] font-bold leading-6 tracking-[-0.3px] tabular-nums text-white">{value}</p>
      <p className={cx("mt-1.5 text-[12px] leading-[14px]", warn && "font-semibold")} style={{ color: warn ? "var(--cravv-status-warning)" : SECONDARY }}>{label}</p>
    </div>
  );
}

