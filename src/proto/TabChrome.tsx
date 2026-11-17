"use client";

/*
 * Chrome over the tab roots (tabs handoff §1): scroll fade (150px gradient behind the bar),
 * the cooking mini bar 6px above the tab bar while a session is live, and the tab bar.
 * Stays put while screens change underneath; tab switches only cross-fade the content.
 */
import { CookingMiniBar, TabBar } from "@/components/cravv";
import { go, switchTab, useNavState } from "./nav";
import { useProto } from "./store";

export function TabChrome({ show }: { show: boolean }) {
  const tab = useNavState((s) => s.tab);
  const live = useProto((s) => s.live);
  const cameraPaused = useProto((s) => s.camera.paused);
  if (!show || !tab) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[70]">
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[150px]" style={{ background: "linear-gradient(180deg, rgba(14,14,16,0) 0%, rgba(14,14,16,0.85) 60%, var(--cravv-bg-deep) 100%)" }} />
      <div className="relative flex flex-col items-stretch gap-1.5 px-5" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        {live && (
          <div className="pointer-events-auto cravv-rise">
            <CookingMiniBar
              mode={live.mode}
              title={live.title}
              detail={cameraPaused ? "Camera paused" : live.detail}
              progress={live.progress}
              cameraPaused={cameraPaused}
              onPress={() => go("placeholder")}
            />
          </div>
        )}
        <div className="pointer-events-auto">
          <TabBar active={tab} onSelect={switchTab} />
        </div>
      </div>
    </div>
  );
}
