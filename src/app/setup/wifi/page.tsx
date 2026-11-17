"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Actions, PrimaryButton, Screen, TopBar, cx } from "@/components/ui";
import { ListHeader } from "@/components/connect/parts";
import { OtherNetworkSheet } from "@/components/connect/HelpSheets";
import { useOnboarding } from "@/lib/store";
import { NETWORKS, joinNetwork, networkSubtitle, type JoinError, type Network } from "@/lib/sim/connect";

/** 10 · Wi-Fi, with the 10x wrong-password state. */
export default function Wifi() {
  const router = useRouter();
  const setDevice = useOnboarding((s) => s.setDevice);
  const [networks, setNetworks] = useState<Network[]>(NETWORKS);
  const [chosen, setChosen] = useState<Network>(NETWORKS[0]);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<JoinError | null>(null);
  const [other, setOther] = useState(false);

  const others = networks.filter((n) => n.ssid !== chosen.ssid);

  function choose(n: Network) {
    if (!networks.some((x) => x.ssid === n.ssid)) setNetworks((list) => [...list, n]);
    setChosen(n);
    setPassword("");
    setError(null);
  }

  async function join() {
    setBusy(true);
    setError(null);
    const res = await joinNetwork(chosen, password);
    if (res.ok) {
      setDevice({ wifi: chosen.ssid });
      router.push("/setup/stove");
      return;
    }
    setBusy(false);
    setError(res.error);
  }

  return (
    <Screen className="h-dvh">
      <TopBar step={2} total={4} />

      {/* Scrolls on short screens; Join Network stays pinned. */}
      <div className="-mx-5 min-h-0 flex-1 overflow-y-auto px-5">
        <h1 className="mt-1 text-[34px] font-bold leading-[41px] tracking-[0.4px] text-white">Connect to Wi-Fi</h1>

        {/* Chosen network */}
        <div className="mt-[11px] flex h-[150px] items-center gap-5 rounded-[20px] border border-white/6 bg-[#1a1a1d] p-[10px]" aria-live="polite">
          <img src="/img/connect/wifi-thumb.svg" alt="" width={126} height={126} className="shrink-0" />
          <div className="min-w-0 pb-[3px]">
            <p className="truncate text-[24px] font-semibold leading-[29px] text-white">{chosen.ssid}</p>
            <p className="mt-[5px] text-[17px] leading-[20px] text-label-2">{networkSubtitle(chosen)}</p>
          </div>
        </div>

        {chosen.secured ? (
          <form
            className="mt-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) join();
            }}
          >
            <ListHeader>
              <label htmlFor="wifi-password">Password</label>
            </ListHeader>
            <div
              className={cx(
                "flex h-[52px] items-center rounded-[26px] border-[1.5px] bg-surface pl-[14.5px] pr-[8.5px]",
                error ? "border-danger" : "border-transparent"
              )}
            >
              <img src="/img/connect/icon-lock.svg" alt="" width={22} height={22} className="shrink-0" />
              <input
                id="wifi-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoComplete="current-password"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Enter password"
                aria-invalid={!!error}
                aria-describedby="wifi-hint"
                className="ml-[14px] h-full min-w-0 flex-1 bg-transparent text-[17px] text-white placeholder:text-label-3 focus:!outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:opacity-60"
              >
                <img src="/img/connect/icon-eye.svg" alt="" width={22} height={22} className={cx(show && "opacity-50")} />
              </button>
            </div>
            <div id="wifi-hint" className="mt-2 px-4 text-[13px] leading-[16px]" aria-live="polite">
              {error ? (
                <>
                  <p className="flex items-start gap-1.5 font-semibold text-danger">
                    <img src="/img/connect/icon-alert.svg" alt="" width={16} height={16} className="shrink-0" />
                    Wrong password. Check it and try again.
                  </p>
                  {error === "too-short" && <p className="mt-1 pl-[22px] text-label-2">Wi-Fi passwords are at least 8 characters.</p>}
                </>
              ) : (
                <p className="text-label-2">Tara needs Wi-Fi to guide you by voice.</p>
              )}
            </div>
            <button type="submit" hidden />
          </form>
        ) : (
          <p className="mt-2 px-4 text-[13px] leading-[16px] text-label-2">Open network. No password needed.</p>
        )}

        <div className="mt-[15px]">
          <ListHeader>Other networks</ListHeader>
          <ul className="overflow-hidden rounded-[26px] bg-surface">
            {others.map((n, i) => (
              <li key={n.ssid} className="relative">
                <button type="button" onClick={() => choose(n)} className="flex h-[52px] w-full items-center pl-4 pr-5 text-left transition active:bg-white/5">
                  <img src="/img/connect/icon-wifi.svg" alt="" width={22} height={22} className="shrink-0" />
                  <span className="ml-[14px] min-w-0 flex-1 truncate text-[17px] text-white">{n.ssid}</span>
                  {n.secured && <img src="/img/connect/icon-lock-small.svg" alt="Secured" width={16} height={16} className="shrink-0" />}
                </button>
                <div className={cx("absolute bottom-0 right-0 h-px bg-[rgba(84,84,88,0.6)]", i === others.length - 1 ? "left-4" : "left-[52px]")} />
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setOther(true)}
                className="flex h-[52px] w-full items-center px-4 text-left text-[17px] text-accent transition active:bg-white/5"
              >
                Other Network…
              </button>
            </li>
          </ul>
        </div>
      </div>

      <Actions>
        <PrimaryButton onClick={join} loading={busy} disabled={chosen.secured && !password}>
          Join Network
        </PrimaryButton>
      </Actions>

      <OtherNetworkSheet
        open={other}
        onClose={() => setOther(false)}
        onChoose={(ssid) => {
          setOther(false);
          choose(networks.find((n) => n.ssid === ssid) ?? { ssid, secured: true });
        }}
      />
    </Screen>
  );
}
