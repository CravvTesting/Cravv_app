"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { diag } from "./telemetry";

/*
 * Never go black. If a screen throws, show what happened (so it can be screenshotted and
 * fixed) with ways out: reload, or reset the prototype. Also surfaces errors that happen
 * outside React (timers, promises).
 */

function ErrorScreen({ message, stack }: { message: string; stack?: string }) {
  return (
    <div className="cravv-bg absolute inset-0 z-[200] flex flex-col overflow-y-auto px-5" style={{ paddingTop: "max(env(safe-area-inset-top), 24px)", paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
      <h1 className="text-[28px] font-bold">Something broke</h1>
      <p className="mt-2 text-[15px] text-secondary">Take a screenshot of this and send it over.</p>
      <pre className="mt-4 whitespace-pre-wrap break-words rounded-[14px] bg-raised p-3 font-mono text-[12px] leading-[16px] text-alert">{message}</pre>
      {stack && <pre className="mt-2 max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words rounded-[14px] bg-raised p-3 font-mono text-[10px] leading-[14px] text-white/60">{stack}</pre>}
      <p className="mt-3 font-mono text-[11px] text-white/40">{typeof location !== "undefined" ? location.hash : ""} · {typeof navigator !== "undefined" ? navigator.userAgent : ""}</p>
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <button type="button" className="h-[52px] rounded-full bg-white text-[17px] font-semibold text-black" onClick={() => location.reload()}>Reload</button>
        <button
          type="button"
          className="h-11 text-[17px] text-white/85"
          onClick={() => { try { localStorage.removeItem("tara-proto"); } catch { /* ignore */ } location.replace("/#/01"); location.reload(); }}
        >
          Reset prototype
        </button>
      </div>
    </div>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error) { console.error("[tara]", error); diag("react-error", { message: error.message, stack: error.stack?.slice(0, 1500) }); }
  render() {
    if (this.state.error) return <ErrorScreen message={String(this.state.error.message || this.state.error)} stack={this.state.error.stack} />;
    return this.props.children;
  }
}

/** Shows errors thrown outside React rendering (timers, async handlers). */
export function GlobalErrors() {
  const [err, setErr] = useState<{ message: string; stack?: string } | null>(null);
  useEffect(() => {
    const onError = (e: ErrorEvent) => setErr({ message: e.message || String(e.error), stack: e.error?.stack });
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason as Error | undefined;
      setErr({ message: r?.message || String(e.reason), stack: r?.stack });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => { window.removeEventListener("error", onError); window.removeEventListener("unhandledrejection", onRejection); };
  }, []);
  return err ? <ErrorScreen message={err.message} stack={err.stack} /> : null;
}
