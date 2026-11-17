"use client";

/**
 * Fetches and decodes every app image once the first screen is idle, so a push/pop never
 * stalls on decoding the incoming screen's photo. The list comes from public/precache.json,
 * generated at build time by scripts/precache.mjs.
 */
export function warmImages() {
  const idle = (cb: () => void) =>
    "requestIdleCallback" in window ? (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(cb) : setTimeout(cb, 300);
  idle(async () => {
    let urls: string[] = [];
    try { urls = await (await fetch("/precache.json")).json(); } catch { return; }
    // Photos first: they're the expensive decodes.
    urls.sort((a, b) => Number(/\.svg$/.test(a)) - Number(/\.svg$/.test(b)));
    for (const u of urls) {
      const img = new Image();
      img.decoding = "async";
      img.src = u;
      try { await img.decode(); } catch { /* ignore */ }
    }
  });
}
