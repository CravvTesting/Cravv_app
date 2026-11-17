"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui";
import { mockSignIn, type Provider } from "@/lib/store";

/*
 * 02 · Create account (4:698) and 02b · Sign in (4:725).
 * Same sheet for both, so returning users don't meet a second pattern.
 * Apple or Google only: no passwords, no codes.
 */
export function AuthSheet({ mode }: { mode: "create" | "signin" }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Provider | null>(null);
  const create = mode === "create";

  async function go(provider: Provider) {
    setBusy(provider);
    await mockSignIn(provider, mode);
    router.push(create ? "/onboarding/name" : "/welcome-back");
  }

  return (
    <main className="app-bg relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden">
      {/* Food mosaic backdrop */}
      <div className="absolute inset-x-0 top-0 aspect-[402/639] overflow-hidden" aria-hidden>
        {/* eslint-disable @next/next/no-img-element */}
        <img src="/img/food-mosaic.jpg" alt="" className="absolute max-w-none" style={{ height: "90.71%", width: "214.57%", left: "-57.35%", top: "-4.01%" }} />
        {!create && (
          <img src="/img/signin-mosaic.webp" alt="" className="absolute max-w-none" style={{ height: "100%", width: "347.58%", left: "-58.22%", top: "-2.61%" }} />
        )}
        {/* eslint-enable @next/next/no-img-element */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180.9deg, rgba(0,0,0,0) 0.5%, #121214 85.4%)" }} />
        <div className="absolute inset-x-0 top-0 h-[130px] bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      <div className="flex-1" />

      <section
        className="animate-sheet-up relative mx-2 mb-2 rounded-sheet bg-sheet px-6 pt-[30px] text-center"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}
        aria-labelledby="auth-title"
      >
        <div className="absolute left-1/2 top-2 h-[5px] w-9 -translate-x-1/2 rounded-[3px] bg-white/25" aria-hidden />
        <h1 id="auth-title" className="text-[28px] font-bold">{create ? "Create your account" : "Welcome back"}</h1>
        <p className="mx-auto mt-1.5 max-w-[300px] text-[15px] leading-5 text-label-2">
          {create ? "Your stove setup, recipes and food preferences, saved." : "Sign in with the Apple or Google account you used before."}
        </p>

        <div className="mt-[18px] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => go("apple")}
            disabled={!!busy}
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-white text-[17px] font-semibold text-black transition active:scale-[0.98] disabled:opacity-70"
          >
            {busy === "apple" ? <Spinner dark /> : (<>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/icon-apple.svg" alt="" width={17} height={17} />
              Continue with Apple
            </>)}
          </button>
          <button
            type="button"
            onClick={() => go("google")}
            disabled={!!busy}
            className="flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-elevated text-[17px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70"
          >
            {busy === "google" ? <Spinner /> : (<>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/icon-google.svg" alt="" width={16} height={16} />
              Continue with Google
            </>)}
          </button>
        </div>

        <p className="mt-4 text-[15px] text-label-2">
          {create ? "Already have an account? " : "New to Tara? "}
          <Link href={create ? "/signin" : "/signup"} replace className="font-semibold text-accent">
            {create ? "Sign In" : "Create Account"}
          </Link>
        </p>
        <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-4 text-label-3">
          By continuing you agree to the Terms of Service and Privacy Policy.
        </p>
      </section>
    </main>
  );
}
