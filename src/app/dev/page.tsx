"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ALLERGIES,
  BackButton,
  CalibrationProgress,
  CalibrationResult,
  Callout,
  Chip,
  ChoiceTile,
  ChoiceTileGroup,
  CloseButton,
  CUISINES,
  DIETS,
  Icon,
  ICON_NAMES,
  InfoTile,
  ListGroup,
  ListRow,
  PrimaryButton,
  SectionTitle,
  SegmentedControl,
  SETUP_NEEDS,
  SetupStep,
  SetupStepStrip,
  SheetHeader,
  SKILLS,
  Spinner,
  StatusPill,
  StepProgress,
  STOVE_TYPES,
  StovePreview,
  TextButton,
  TextField,
  Viewfinder,
} from "@/components/cravv";

function Section({ title, node, children }: { title: string; node: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-white/10 py-6" data-section={title}>
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-secondary">
        {title} <span className="font-normal normal-case opacity-60">· {node}</span>
      </h2>
      {children}
    </section>
  );
}

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function DevPage() {
  const [burners, setBurners] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [units, setUnits] = useState<"us" | "metric">("us");
  const [step, setStep] = useState(2);
  const [diets, setDiets] = useState<string[]>(["vegetarian"]);
  const [allergies, setAllergies] = useState<string[]>(["peanuts"]);
  const [cuisines, setCuisines] = useState<string[]>(["indian"]);
  const [skill, setSkill] = useState<string>("comfortable");
  const [stove, setStove] = useState<string>("electric-coil");
  const [name, setName] = useState("Priya");
  const [pw, setPw] = useState("hunter22pw");
  const [progress, setProgress] = useState(0.65);
  const [btn, setBtn] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    if (btn === "loading") {
      const t = setTimeout(() => setBtn("done"), 1500);
      return () => clearTimeout(t);
    }
    if (btn === "done") {
      const t = setTimeout(() => setBtn("idle"), 1500);
      return () => clearTimeout(t);
    }
  }, [btn]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-[440px] px-5 pb-24 pt-6">
      <h1 className="text-[34px] font-bold leading-[41px]">Components</h1>
      <p className="mt-1 text-[15px] text-secondary">src/components/cravv · Figma section 2608:10940</p>

      <Section title="Stove preview" node="2610:4068">
        <StovePreview burners={burners} type={STOVE_TYPES.find((s) => s.id === stove)?.label ?? "Gas"} />
        <SegmentedControl label="Burners" options={[1, 2, 3, 4, 5] as const} value={burners} onChange={setBurners} />
      </Section>

      <Section title="Segmented control" node="2610:4171 / 2525:2772">
        <SegmentedControl label="Burners (static 1)" options={[1, 2, 3, 4, 5]} value={1} onChange={() => {}} />
        <div className="w-[147px]">
          <SegmentedControl
            label="Units"
            variant="pill"
            options={[
              { value: "us", label: "US" },
              { value: "metric", label: "Metric" },
            ]}
            value={units}
            onChange={setUnits}
          />
        </div>
      </Section>

      <Section title="Step progress" node="2611:4083">
        {[1, 2, 3].map((c) => (
          <StepProgress key={`3-${c}`} steps={3} current={c} />
        ))}
        {[1, 2, 3, 4].map((c) => (
          <StepProgress key={`4-${c}`} steps={4} current={c} />
        ))}
        <div className="flex items-center gap-4">
          <BackButton onClick={() => setStep((s) => Math.max(1, s - 1))} />
          <StepProgress steps={4} current={step} />
        </div>
        <TextButton onClick={() => setStep((s) => (s % 4) + 1)}>Next step ({step})</TextButton>
      </Section>

      <Section title="Chip" node="2611:4108">
        <div className="flex flex-wrap gap-2">
          <Chip label="Vegetarian" icon="utensils" token="diet-vegetarian" state="off" />
          <Chip label="Vegetarian" icon="leaf" token="diet-vegetarian" state="on" />
          <Chip label="Vegetarian" icon="peanut" token="allergy-avoid" state="avoid" />
        </div>
        <SectionTitle inset={false} className="mt-2">Diet</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => (
            <Chip key={d.id} {...d} state={diets.includes(d.id) ? "on" : "off"} onClick={() => setDiets(toggle(diets, d.id))} />
          ))}
        </div>
        <SectionTitle inset={false} className="mt-2">Allergies</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {ALLERGIES.map((d) => (
            <Chip
              key={d.id}
              {...d}
              state={allergies.includes(d.id) ? "avoid" : "off"}
              onClick={() => setAllergies(toggle(allergies, d.id))}
            />
          ))}
        </div>
        <SectionTitle inset={false} className="mt-2">Cuisines</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((d) => (
            <Chip key={d.id} {...d} state={cuisines.includes(d.id) ? "on" : "off"} onClick={() => setCuisines(toggle(cuisines, d.id))} />
          ))}
        </div>
      </Section>

      <Section title="Choice tile" node="2611:4126">
        <ChoiceTileGroup label="In the kitchen, you are">
          {SKILLS.map((s) => (
            <ChoiceTile key={s.id} {...s} selected={skill === s.id} onClick={() => setSkill(s.id)} />
          ))}
        </ChoiceTileGroup>
      </Section>

      <Section title="Info tile" node="2611:4135">
        <div className="grid grid-cols-3 gap-[7px]">
          {SETUP_NEEDS.map((s) => (
            <InfoTile key={s.id} {...s} hint={s.hint} />
          ))}
        </div>
      </Section>

      <Section title="Status pill" node="2611:4150">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="success">Tara is online · Home WiFi</StatusPill>
          <StatusPill tone="warning">Weak Wi-Fi · Home WiFi</StatusPill>
          <StatusPill tone="error">Tara is offline</StatusPill>
        </div>
      </Section>

      <Section title="Text field" node="2611:4187">
        <TextField label="Your name" value={name} onChange={setName} trailing="From Apple ID" />
        <TextField label="Your name" value={name} onChange={setName} trailing="From Apple ID" error="Enter your name" />
        <TextField label="Wi-Fi password" type="password" value={pw} onChange={setPw} />
        <TextField label="Wi-Fi password" type="password" value={pw} onChange={setPw} error="Wrong password. Try again." />
      </Section>

      <Section title="List row + group" node="2611:4206">
        <SectionTitle>Stove type</SectionTitle>
        <ListGroup label="Stove type">
          {STOVE_TYPES.map((s) => (
            <ListRow key={s.id} {...s} selected={stove === s.id} onClick={() => setStove(s.id)} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Sheet header" node="2612:4051">
        <div className="rounded-t-[38px] bg-recessed">
          <SheetHeader title="Create your account" subtitle="Your stove setup, recipes and food preferences, saved." />
        </div>
      </Section>

      <Section title="Calibration result" node="2612:4077">
        <CalibrationResult seen={4} picked={4} />
        <CalibrationResult seen={3} picked={4} />
        <CalibrationResult seen={5} picked={4} />
      </Section>

      <Section title="Calibration progress" node="2612:4084">
        <CalibrationProgress label="Looking for 4 burners" progress={progress} />
        <input
          aria-label="Progress"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
        />
      </Section>

      <Section title="Setup step + strip" node="2612:4090 / 2532:2811">
        <SetupStep number="01" label="Camera docked" />
        <SetupStepStrip steps={["Camera docked", "Plug in", "“Hello” on screen"]} />
        <SetupStepStrip steps={["Lift off base", "Magnet side up", "Light on"]} />
      </Section>

      <Section title="Viewfinder" node="2612:4093">
        <div className="flex items-end gap-6">
          <Viewfinder size={168}>
            <div className="h-full w-full bg-[#3a3a3c]/60" />
          </Viewfinder>
          <Viewfinder size={{ width: 120, height: 80 }} />
        </div>
      </Section>

      <Section title="Callout" node="2612:4103">
        <div className="flex gap-3">
          <Callout number="01" label="Display" />
          <Callout number={2} label="Camera" />
        </div>
      </Section>

      <Section title="Buttons" node="frames 2532:2809 / 2525:2746 / 2525:2906">
        <PrimaryButton
          loading={btn === "loading"}
          done={btn === "done"}
          onClick={() => btn === "idle" && setBtn("loading")}
        >
          Join network
        </PrimaryButton>
        <PrimaryButton>Continue</PrimaryButton>
        <PrimaryButton loading>Continue</PrimaryButton>
        <PrimaryButton done>Continue</PrimaryButton>
        <PrimaryButton disabled>Continue</PrimaryButton>
        <TextButton>Nothing on the Screen?</TextButton>
        <div className="flex gap-4">
          <BackButton />
          <CloseButton />
        </div>
        <div className="flex items-center gap-4 text-white">
          <Spinner />
          <Spinner size={32} color="var(--cravv-text-secondary)" />
        </div>
      </Section>

      <Section title="Icons" node="2617:4051">
        <div className="grid grid-cols-5 gap-y-4" data-testid="icons">
          {ICON_NAMES.map((n) => (
            <div key={n} className="flex flex-col items-center gap-2" data-icon={n}>
              <Icon name={n} style={{ color: "var(--cravv-option-icon-off)" }} />
              <span className="text-[11px] text-white/55">{n}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Icon name="leaf" size={20} style={{ color: "var(--cravv-option-diet-vegetarian-base)" }} />
          <Icon name="coil" style={{ color: "var(--cravv-option-stove-electric-coil-base)" }} />
          <Icon name="peanut" strike style={{ color: "var(--cravv-option-allergy-avoid-base)" }} />
          <Icon name="milk" strike style={{ color: "var(--cravv-option-icon-off)" }} />
        </div>
      </Section>
    </main>
  );
}
