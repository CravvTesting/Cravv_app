"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHydrated, useOnboarding } from "@/lib/store";

/** Entry point: onboarded users go home, everyone else starts at "Meet Tara". */
export default function Index() {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useOnboarding((s) => s.onboarded);
  useEffect(() => {
    if (hydrated) router.replace(onboarded ? "/home" : "/welcome");
  }, [hydrated, onboarded, router]);
  return <main className="app-bg min-h-dvh" />;
}
