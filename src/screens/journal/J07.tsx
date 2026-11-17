"use client";

/*
 * J07 Collection: mosaic cover, Pick Tonight (placeholder), Shop All (every ingredient →
 * Grocery, then the Grocery segment), the recipe list. Long-press a row and drag to reorder
 * (pointer events + transform only); tap a recipe for J08 Save to collections.
 */
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ActionSheet, BackButton, cx, Icon, PRESS } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useProto } from "@/proto/store";
import type { GroceryList } from "@/proto/seed/journal";
import { recipe, useJournalUi } from "./data";
import { Glyph, Hairline, ICON_OFF, Mosaic, RoundButton, SECONDARY, Thumb } from "./parts";

const ROW = 68;
const LONG_PRESS_MS = 350;
const SHOWN = 5;

export default function J07() {
  const collectionId = useJournalUi((s) => s.collectionId);
  const collections = useProto((s) => s.collections);
  const grocery = useProto((s) => s.grocery);
  const setStore = useProto((s) => s.set);
  const setDebug = useProto((s) => s.setDebug);
  const col = collections.find((c) => c.id === collectionId) ?? collections.find((c) => c.id === "weeknight") ?? collections[0];
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);

  if (!col) return <div className="cravv-bg h-full" />;

  const ids = col.recipeIds;
  const shown = expanded ? ids : ids.slice(0, SHOWN);
  const avg = ids.length ? Math.floor(ids.reduce((s, id) => s + recipe(id).minutes, 0) / ids.length / 5) * 5 : 0;

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...ids];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setStore({ collections: collections.map((c) => (c.id === col.id ? { ...c, recipeIds: next } : c)) });
  };

  const shopAll = () => {
    const lists: GroceryList[] = grocery.map((l) => ({ ...l, items: [...l.items] }));
    for (const id of ids) {
      const r = recipe(id);
      if (!r.ingredients?.length) continue;
      const list = lists.find((l) => l.dish === r.name);
      if (list) {
        for (const i of r.ingredients) if (!list.items.some((x) => x.name === i.name)) list.items.push({ ...i, have: false });
        list.selected = true;
      } else {
        lists.splice(Math.max(0, lists.length - (lists.at(-1)?.dish === "Other" ? 1 : 0)), 0, {
          dish: r.name, recipeId: r.id, source: `From ${col.name}`, selected: true, items: r.ingredients.map((i) => ({ ...i, have: false })),
        });
      }
    }
    setStore({ grocery: lists });
    setDebug({ groceryData: "persona" });
    // Back to the Journal root, on the Grocery segment.
    go("J06", { dir: "pop" });
    go("J11", { replace: true, dir: "none" });
  };

  return (
    <div className="cravv-bg relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20" style={{ paddingTop: "max(env(safe-area-inset-top), 8px)" }}>
        <div className="flex h-[52px] items-center justify-between px-4">
          <BackButton onClick={() => back()} />
          {col.id !== "all" && <RoundButton label="More" glyph="more" onClick={() => setMenu(true)} />}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5" style={{ paddingTop: "calc(max(env(safe-area-inset-top), 8px) + 8px)", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
        <div className="flex justify-center"><Mosaic recipeIds={ids} size={200} radius={24} /></div>
        <h1 className="mt-[18px] text-center text-[26px] font-bold leading-[31px] text-white">{col.name}</h1>
        <p className="mt-1 text-center text-[14px] leading-[17px]" style={{ color: SECONDARY }}>
          {ids.length} {ids.length === 1 ? "recipe" : "recipes"}{avg ? ` · about ${avg} min each` : ""}{col.shared ? " · shared" : ""}
        </p>

        <div className="mt-[19px] grid grid-cols-2 gap-3">
          <button type="button" onClick={() => go("placeholder")} className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-[17px] font-semibold transition-transform active:scale-[0.98]" style={{ color: "var(--cravv-button-primary-label)" }}>
            <Glyph name="shuffle" size={22} />
            Pick Tonight
          </button>
          <button type="button" onClick={shopAll} className="flex h-12 items-center justify-center gap-2 rounded-full bg-white/[0.12] text-[17px] font-semibold text-white transition-transform active:scale-[0.98]">
            <Icon name="cart" size={22} />
            Shop All
          </button>
        </div>

        <ReorderList ids={shown} onReorder={reorder} onOpen={(recipeId) => { useJournalUi.getState().set({ recipeId }); go("J08"); }} />

        {ids.length > SHOWN && (
          <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-1 flex h-11 items-center px-4 text-[15px] font-semibold active:opacity-50" style={{ color: "var(--cravv-text-accent)" }}>
            {expanded ? "Show less" : `+ ${ids.length - SHOWN} more`}
          </button>
        )}
      </div>

      <AnimatePresence>
        {menu && (
          <ActionSheet
            title={col.name}
            actions={[
              {
                label: col.shared ? "Stop Sharing" : "Share with Family",
                onPress: () => { setStore({ collections: collections.map((c) => (c.id === col.id ? { ...c, shared: !c.shared } : c)) }); setMenu(false); },
              },
              {
                label: "Delete Collection",
                destructive: true,
                onPress: () => { setMenu(false); setStore({ collections: collections.filter((c) => c.id !== col.id) }); back(); },
              },
            ]}
            onCancel={() => setMenu(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Recipe rows with long-press-and-drag reordering. Only transforms move during the drag. */
function ReorderList({ ids, onReorder, onOpen }: { ids: string[]; onReorder: (from: number, to: number) => void; onOpen: (id: string) => void }) {
  const m = useMotionTokens();
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const press = useRef<{ i: number; y0: number; timer: ReturnType<typeof setTimeout> | null; active: boolean; moved: boolean; target: number; pointerId: number } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);

  // While dragging, stop the page from scrolling (iOS needs a non-passive touchmove).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => { if (press.current?.active) e.preventDefault(); };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  const shiftFor = (i: number) => {
    if (dragging === null || target === null || i === dragging) return 0;
    if (dragging < target && i > dragging && i <= target) return -ROW;
    if (dragging > target && i < dragging && i >= target) return ROW;
    return 0;
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>, i: number) => {
    if (e.button !== 0) return;
    const el = e.currentTarget;
    const pointerId = e.pointerId;
    press.current = {
      i, y0: e.clientY, active: false, moved: false, target: i, pointerId,
      timer: setTimeout(() => {
        const p = press.current;
        if (!p || p.moved) return;
        p.active = true;
        try { el.setPointerCapture(pointerId); } catch { /* ignore */ }
        navigator.vibrate?.(10);
        setDragging(i);
        setTarget(i);
        const row = rowRefs.current[i];
        if (row) row.style.transform = "translate3d(0,0,0) scale(1.03)";
      }, LONG_PRESS_MS),
    };
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (!p) return;
    const dy = e.clientY - p.y0;
    if (!p.active) {
      if (Math.abs(dy) > 8) { p.moved = true; if (p.timer) clearTimeout(p.timer); press.current = null; }
      return;
    }
    const min = -p.i * ROW, max = (ids.length - 1 - p.i) * ROW;
    const y = Math.max(min - 12, Math.min(max + 12, dy));
    const row = rowRefs.current[p.i];
    if (row) row.style.transform = `translate3d(0,${y}px,0) scale(1.03)`;
    const t = Math.max(0, Math.min(ids.length - 1, Math.round(p.i + y / ROW)));
    if (t !== p.target) { p.target = t; setTarget(t); }
  };

  const onUp = () => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    if (!p.active) return;
    suppressClick.current = true;
    const row = rowRefs.current[p.i];
    if (row) {
      const from = row.style.transform;
      const to = `translate3d(0,${(p.target - p.i) * ROW}px,0)`;
      const anim = row.animate([{ transform: from }, { transform: to }], { duration: 200 * m.scale, easing: "cubic-bezier(0.32, 0.72, 0, 1)" });
      row.style.transform = to;
      const finish = () => {
        rowRefs.current.forEach((r) => { if (r) { r.style.transform = ""; r.style.transition = "none"; } });
        onReorder(p.i, p.target);
        setDragging(null);
        setTarget(null);
        requestAnimationFrame(() => rowRefs.current.forEach((r) => { if (r) r.style.transition = ""; }));
      };
      anim.finished.then(finish, finish);
    } else {
      setDragging(null);
      setTarget(null);
    }
  };

  return (
    <div ref={listRef} className="mt-4">
      <div className="rounded-[16px]" style={{ background: "var(--cravv-surface-raised)" }}>
        <div className="relative">
          {ids.map((id, i) => {
            const r = recipe(id);
            const isDrag = dragging === i;
            return (
              <div
                key={id}
                ref={(el) => { rowRefs.current[i] = el; }}
                className={cx("relative select-none", isDrag ? "z-10" : "z-0")}
                style={{
                  transform: isDrag ? undefined : `translate3d(0,${shiftFor(i)}px,0)`,
                  transition: isDrag ? "none" : `transform ${0.25 * m.scale}s var(--ease-ios)`,
                  touchAction: dragging !== null ? "none" : "pan-y",
                }}
                onPointerDown={(e) => onDown(e, i)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onContextMenu={(e) => e.preventDefault()}
              >
                <button
                  type="button"
                  onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onOpen(id); }}
                  className={cx("relative flex h-[68px] w-full items-center pl-4 pr-4 text-left", PRESS, i === 0 && "rounded-t-[16px]", i === ids.length - 1 && "rounded-b-[16px]")}
                  style={{
                    background: "var(--cravv-surface-raised)",
                    boxShadow: isDrag ? "0 10px 30px rgba(0,0,0,0.45)" : undefined,
                    borderRadius: isDrag ? 16 : undefined,
                  }}
                >
                  {i > 0 && !isDrag && <Hairline inset={72} />}
                  <Thumb src={r.photo} />
                  <span className="ml-3 flex min-w-0 flex-1 flex-col self-start pt-[13px]">
                    <span className="truncate text-[16px] font-semibold leading-[19px] text-white">{r.name}</span>
                    <span className="mt-[3px] truncate text-[12px] leading-[14px]" style={{ color: SECONDARY }}>
                      {r.minutes >= 60 ? `${Math.floor(r.minutes / 60)} hr${r.minutes % 60 ? ` ${r.minutes % 60} min` : ""}` : `${r.minutes} min`} · {r.cuisine}
                    </span>
                  </span>
                  <span aria-hidden style={{ color: ICON_OFF }}><Glyph name="grip" size={22} /></span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <p className="sr-only">Press and hold a recipe, then drag to reorder.</p>
    </div>
  );
}
