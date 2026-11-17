"use client";

/*
 * J13 Adding to Instacart → J14 Cart ready (one component). The job itself lives in
 * instacart.ts so it keeps going when you leave. Stop asks first (action sheet).
 * J14's lists follow debug.instacart: all added / some changed / some unavailable.
 */
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { ActionSheet, PrimaryButton, ProgressBar, Spinner } from "@/components/cravv";
import { useMotionTokens } from "@/proto/motion";
import { back, go } from "@/proto/nav";
import { useProto, type ScreenId } from "@/proto/store";
import { LargeTitleScreen } from "@/proto/ui";
import { outcomes, shelfDetail, swapNote, useInstacart, type CartItem, type Outcome } from "./instacart";
import { Card, Glyph, Hairline, SECONDARY, TERTIARY } from "./parts";

function cartFromGrocery(): CartItem[] {
  return useProto
    .getState()
    .grocery.filter((l) => l.selected ?? true)
    .flatMap((l) => l.items.filter((i) => !i.have).map((i) => ({ dish: l.dish, name: i.name, amount: i.amount })));
}

export default function Instacart({ id }: { id: ScreenId }) {
  const job = useInstacart();
  // Snapshot of what's being sent, so J14 doesn't depend on the job after it resets.
  const [items, setItems] = useState<CartItem[]>(() => (job.items.length ? job.items : cartFromGrocery()));

  // Deep link to J13 (or J13 opened with no job): start one. Finished already: show the result.
  useEffect(() => {
    if (id !== "J13") return;
    const s = useInstacart.getState();
    if (s.status === "idle") {
      const cart = cartFromGrocery();
      setItems(cart);
      s.start(cart);
    } else if (s.status === "done") {
      go("J14", { replace: true, dir: "none" });
    } else if (s.items.length) {
      setItems(s.items);
    }
  }, [id]);

  return id === "J14" ? <CartReady /> : <Adding items={job.items.length ? job.items : items} done={job.done} />;
}

// ---------------------------------------------------------------------------
// J13
// ---------------------------------------------------------------------------

function Adding({ items, done }: { items: CartItem[]; done: number }) {
  const [confirm, setConfirm] = useState(false);
  const stop = useInstacart((s) => s.stop);
  const dishes = [...new Set(items.map((i) => i.dish))];

  return (
    <>
      <LargeTitleScreen
        title="Adding to Instacart"
        back
        subtitle="About a minute. You can leave; we’ll let you know when your cart is ready."
        footer={
          <button type="button" onClick={() => setConfirm(true)} className="h-[52px] w-full rounded-full bg-white/10 text-[17px] font-semibold text-white transition-transform active:scale-[0.98]">
            Stop Adding
          </button>
        }
      >
        <ProgressBar value={items.length ? done / items.length : 0} color="var(--cravv-progress-fill)" />
        <p className="mt-2 text-[13px] font-semibold leading-4 tabular-nums" style={{ color: SECONDARY }} aria-live="polite">
          {Math.min(done, items.length)} of {items.length} {items.length === 1 ? "item" : "items"}
        </p>
        <Card className="mt-[18px] px-4 pb-1.5">
          {dishes.map((dish) => (
            <div key={dish}>
              <p className="pb-1.5 pt-3.5 text-[11px] font-semibold uppercase leading-[13px]" style={{ color: TERTIARY }}>{dish}</p>
              {items.map((item, idx) =>
                item.dish !== dish ? null : <ProgressRow key={`${item.name}-${idx}`} name={item.name} state={idx < done ? "added" : idx === done ? "adding" : "waiting"} />
              )}
            </div>
          ))}
        </Card>
      </LargeTitleScreen>
      <AnimatePresence>
        {confirm && (
          <ActionSheet
            title="Stop adding to Instacart?"
            message="Items already in your cart stay there. The rest stay on your grocery list."
            actions={[{ label: "Stop Adding", destructive: true, onPress: () => { setConfirm(false); stop(); back(); } }]}
            cancelLabel="Keep Going"
            onCancel={() => setConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function ProgressRow({ name, state }: { name: string; state: "added" | "adding" | "waiting" }) {
  const m = useMotionTokens();
  const fade = `opacity ${0.25 * m.scale}s ease, transform ${0.35 * m.scale}s cubic-bezier(0.34,1.56,0.64,1)`;
  return (
    <div className="flex h-[46px] items-center gap-3">
      <span className="relative flex size-[22px] shrink-0 items-center justify-center">
        <span className="absolute inset-0.5 rounded-full" style={{ boxShadow: "inset 0 0 0 1.5px rgb(255 255 255 / 0.3)", opacity: state === "waiting" ? 1 : 0, transition: fade }} />
        {state === "adding" && <Spinner size={20} color="var(--cravv-progress-fill)" label="" />}
        <span className="absolute inset-0" style={{ color: "var(--cravv-status-success)", opacity: state === "added" ? 1 : 0, transform: state === "added" || m.reduced ? "scale(1)" : "scale(0.5)", transition: fade }}>
          <Glyph name="checkcircle" size={22} />
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate text-[16px]" style={{ color: state === "waiting" ? "rgb(255 255 255 / 0.45)" : "white" }}>{name}</span>
      <span
        className="shrink-0 text-[13px] font-semibold"
        style={{ color: state === "added" ? "var(--cravv-status-success)" : state === "adding" ? "var(--cravv-progress-fill)" : "rgb(235 235 245 / 0.45)" }}
      >
        {state === "added" ? "Added" : state === "adding" ? "Adding…" : "Waiting"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// J14
// ---------------------------------------------------------------------------

function CartReady() {
  const mode = useProto((s) => s.debug.instacart);
  const result = useInstacart((s) => s.result);
  const m = useMotionTokens();
  // Deep link without a finished send: preview what the current lists would give.
  const [preview] = useState(() => cartFromGrocery());
  const items = result?.items ?? preview;
  const res = result?.outcomes ?? outcomes(items, mode);
  const by = (o: Outcome) => items.map((it, i) => ({ it, o: res[i] })).filter((x) => x.o === o).map((x) => x.it);
  const notAdded = by("unavailable"), changed = by("changed"), added = by("added");

  // Seen: Grocery offers a fresh send again.
  useEffect(() => () => useInstacart.getState().seen(), []);

  const settle = (k: number) => ({
    animation: m.reduced ? undefined : `j14-settle ${0.5 * m.scale}s var(--ease-ios) ${0.08 * k * m.scale}s both`,
  });
  let k = 0;

  return (
    <LargeTitleScreen
      title="Your cart is ready"
      back
      subtitle={`${added.length + changed.length} of ${items.length} items added. Review and pay in Instacart.`}
      footer={<PrimaryButton onClick={() => go("placeholder")}>Review in Instacart</PrimaryButton>}
    >
      <style>{`@keyframes j14-settle { from { opacity: 0; transform: translate3d(0,14px,0); } to { opacity: 1; transform: none; } }`}</style>
      <div className="flex flex-col gap-3">
        {notAdded.length > 0 && (
          <Group style={settle(k++)} icon="xcircle" color="var(--cravv-status-alert)" title="Not added" count={notAdded.length}>
            {notAdded.map((i, n) => (
              <Line key={`${i.dish}-${i.name}-${n}`} name={i.name} note="Out of stock at your store. Still on your grocery list." noteColor="var(--cravv-status-alert)" />
            ))}
          </Group>
        )}
        {changed.length > 0 && (
          <Group style={settle(k++)} icon="swap" color="var(--cravv-status-warning)" title="Added with a change" count={changed.length}>
            {changed.map((i, n) => (
              <Line key={`${i.dish}-${i.name}-${n}`} name={i.name} amount={i.amount} note={swapNote(i.name)} noteColor="var(--cravv-status-warning)" />
            ))}
          </Group>
        )}
        {added.length > 0 && (
          <Group style={settle(k++)} icon="checkcircle" color="var(--cravv-status-success)" title="Added" count={added.length}>
            {added.map((i, n) => (
              <Line key={`${i.dish}-${i.name}-${n}`} name={i.name} note={shelfDetail(i.name, i.amount)} />
            ))}
          </Group>
        )}
      </div>
    </LargeTitleScreen>
  );
}

function Group({ icon, color, title, count, children, style }: { icon: "xcircle" | "swap" | "checkcircle"; color: string; title: string; count: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={style}>
      <Card>
        <div className="flex h-12 items-center gap-2.5 px-4">
          <Glyph name={icon} size={20} style={{ color }} />
          <h2 className="flex-1 text-[15px] font-semibold text-white">{title}</h2>
          <span className="text-[14px] font-semibold tabular-nums" style={{ color }}>{count}</span>
        </div>
        {children}
      </Card>
    </section>
  );
}

function Line({ name, amount, note, noteColor }: { name: string; amount?: string; note?: string; noteColor?: string }) {
  return (
    <div className="relative flex min-h-[60px] flex-col justify-center px-4 py-2.5">
      <Hairline inset={16} right={16} />
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[16px] text-white">{name}</span>
        {amount && <span className="shrink-0 text-[13px]" style={{ color: TERTIARY }}>{amount}</span>}
      </div>
      {note && <span className="mt-0.5 text-[13px] leading-4" style={{ color: noteColor ?? SECONDARY }}>{note}</span>}
    </div>
  );
}
