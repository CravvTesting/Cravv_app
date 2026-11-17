"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  AccountCard,
  ActionSheet,
  COURSES,
  CookingMiniBar,
  DayHeader,
  FilterButton,
  MacroRingCard,
  MealChip,
  MealFilterRow,
  MealRow,
  MEALS,
  MORE,
  NUTRIENTS,
  NutrientRow,
  Rating,
  SettingsGroup,
  SettingsRow,
  Switch,
  TabBar,
  TaraCard,
  TargetsRow,
  TipNote,
  type MealId,
  type TabId,
  type TaraState,
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

      <TabsShowcase />

      <Section title="Icons" node="2617:4051">
        <p className="text-[13px] text-secondary">71 glyphs: 55 onboarding + 16 from Icon grid · Tabs / · Meal filter.</p>
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

/* ── Components · Tabs ─────────────────────────────────────────────────────── */

function Pressed({ children }: { children: ReactNode }) {
  // Static "Pressed" variant for comparison: the 8% overlay the :active state adds.
  return <div className="relative inline-flex [&>button]:after:opacity-[0.08]">{children}</div>;
}

function TabsShowcase() {
  const [tab, setTab] = useState<TabId>("nutrition");
  const [cook, setCook] = useState(0.48);
  const [paused, setPaused] = useState(false);
  const [sw, setSw] = useState(true);
  const [notif, setNotif] = useState(false);
  const [eaten, setEaten] = useState({ protein: 44, carbs: 120, fat: 46 });
  const [ringKey, setRingKey] = useState(0);
  const [tara, setTara] = useState<TaraState>("online");
  const [sheet, setSheet] = useState(false);
  const [signedOut, setSignedOut] = useState(0);
  const [stars, setStars] = useState(3);
  const [meal, setMeal] = useState<MealId | null>("breakfast");
  const [filters, setFilters] = useState(0);
  const [courses, setCourses] = useState<string[]>(["mains"]);
  const [more, setMore] = useState<string[]>(["hands-off"]);
  const [dayTotal, setDayTotal] = useState(1070);

  useEffect(() => {
    const id = setInterval(() => setCook((p) => (p >= 1 ? 0 : Math.round((p + 0.02) * 100) / 100)), 1000);
    return () => clearInterval(id);
  }, []);

  const kcalEaten = eaten.protein * 4 + eaten.carbs * 4 + eaten.fat * 9;

  return (
    <>
      <h2 className="mt-6 border-t border-white/10 pt-6 text-[28px] font-bold leading-[34px]" data-section="Tabs">
        Tabs
      </h2>
      <p className="mt-1 text-[15px] text-secondary">Components · Tabs (handoff §4, §11)</p>

      <Section title="Tab bar" node="2674:6167">
        <TabBar active={tab} onSelect={setTab} />
        {(["home", "nutrition", "journal", "profile"] as const).map((t) => (
          <div key={t} data-variant={`tab-${t}`}>
            <TabBar active={t} onSelect={setTab} />
          </div>
        ))}
      </Section>

      <Section title="Cooking mini bar" node="2674:6186">
        <div data-variant="mini-cooking">
          <CookingMiniBar
            mode="cooking"
            title="Rajma Chawal · Step 4 of 9"
            detail="Back left · 6:12 · Tara is watching"
            progress={cook}
            photo="/img/home/green-curry.webp"
            cameraPaused={paused}
            onPress={() => setPaused((p) => !p)}
          />
        </div>
        <div data-variant="mini-watching">
          <CookingMiniBar mode="watching" title="Watching 2 burners" detail="Front right · whistle 2 of 3" progress={0.48} />
        </div>
        <p className="text-[13px] text-secondary">Tap the first bar to toggle cameraPaused. Progress: {Math.round(cook * 100)}%</p>
      </Section>

      <Section title="Settings row + group" node="2674:6230">
        <div className="flex flex-col gap-6" data-variant="settings-types">
          <SettingsRow type="navigation" label="Notifications" icon="bell" separator={false} />
          <SettingsRow type="value" label="Notifications" icon="bell" value="Home WiFi" separator={false} />
          <SettingsRow type="two-line" label="Notifications" icon="bell" subtitle="Vegetarian · avoids peanuts" separator={false} />
          <SettingsRow type="switch" label="Notifications" icon="bell" checked={sw} onChange={setSw} separator={false} />
          <SettingsRow type="destructive" label="Notifications" separator={false} />
        </div>
        <div data-variant="settings-profile" className="flex flex-col gap-6">
          <SettingsGroup header="Tara">
            <TaraCard state={tara} lastSeen="6:40 PM" onPress={() => {}} onSetUp={() => setTara("online")} />
            <SettingsRow type="two-line" icon="display" label="Stove and camera" subtitle="Electric coil · 4 burners · calibrated" />
            <SettingsRow type="two-line" icon="shield" label="Safety and alerts" subtitle="Tara first, then your phone" />
            <SettingsRow type="two-line" icon="eye" label="Camera and privacy" subtitle="What Tara sees and what it keeps" />
          </SettingsGroup>
          <SettingsGroup header="App" footer="Alerts reach your phone when Tara needs you.">
            <SettingsRow type="switch" icon="bell" label="Notifications" checked={notif} onChange={setNotif} />
            <SettingsRow icon="help" label="Help and feedback" />
          </SettingsGroup>
          <SettingsGroup>
            <SettingsRow type="destructive" label="Sign Out" onPress={() => setSheet(true)} />
          </SettingsGroup>
        </div>
        {signedOut > 0 && <p className="text-[13px] text-secondary">Signed out {signedOut}×</p>}
      </Section>

      <Section title="Switch" node="2674:6233">
        <div className="flex items-center gap-10" data-variant="switch">
          <Switch checked label="On" onChange={() => {}} />
          <Switch checked={false} label="Off" onChange={() => {}} />
          <Switch checked={sw} label="Interactive" onChange={setSw} />
        </div>
      </Section>

      <Section title="Meal row + day header" node="2674:6290 / 2674:6293">
        <div className="flex flex-col gap-4" data-variant="meal-rows">
          <MealRow context="nutrition" type="logged" slot="Breakfast" name="Greek yogurt bowl" detail="8:10 AM · logged" kcal={320} separator={false} />
          <MealRow context="nutrition" type="tara-cook" slot="Lunch" name="Thai Green Curry" detail="Cooked with Tara · 1:10 PM" kcal={540} photo="/img/home/green-curry.webp" separator={false} />
          <MealRow context="nutrition" type="not-logged" slot="Dinner" detail="Cooking tonight? Tara logs it for you." onLog={() => setDayTotal((t) => t + 410)} separator={false} />
          <MealRow context="journal" type="tara-cook" name="Thai Green Curry" detail="Lunch · cooked with Tara" kcal={540} rating={4} photo="/img/home/green-curry.webp" separator={false} />
          <MealRow context="journal" type="logged" name="Greek yogurt bowl" detail="Breakfast · logged" kcal={320} separator={false} />
        </div>
        <div data-variant="day-header">
          <DayHeader label="Today · Tue 17" kcal={dayTotal} />
        </div>
        <SettingsGroup>
          <MealRow context="journal" type="tara-cook" name="Thai Green Curry" detail="Lunch · cooked with Tara" kcal={540} rating={4} photo="/img/home/green-curry.webp" onPress={() => {}} />
          <MealRow context="journal" type="logged" name="Greek yogurt bowl" detail="Breakfast · logged" kcal={320} onPress={() => {}} />
        </SettingsGroup>
        <p className="text-[13px] text-secondary">Tap Log to add 410 kcal: the day total ticks up.</p>
      </Section>

      <Section title="Nutrient row" node="2675:6100">
        <div className="flex flex-col gap-4" data-variant="nutrients">
          <NutrientRow nutrient="fiber" value={15} target={27} separator={false} />
          <NutrientRow nutrient="sodium" value={1090} target={2300} separator={false} />
        </div>
        <SettingsGroup>
          {NUTRIENTS.map((n, i) => (
            <NutrientRow key={n.id} nutrient={n.id} value={[44, 120, 46, 15, 2600, 18, 12][i]} target={[85, 250, 63, 27, 2300, 25, 20][i]} />
          ))}
        </SettingsGroup>
      </Section>

      <Section title="Macro ring card" node="2675:6122">
        <div data-variant="ring">
          <MacroRingCard key={ringKey} kcalTarget={1900} kcalEaten={kcalEaten} macros={{ protein: { value: eaten.protein, target: 85 }, carbs: { value: eaten.carbs, target: 250 }, fat: { value: eaten.fat, target: 63 } }} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip label="Log 30 g protein" icon="drumstick" token="nutrient-protein" state="off" onClick={() => setEaten((e) => ({ ...e, protein: e.protein + 30 }))} />
          <Chip label="Log a big dinner" icon="bowl" token="nutrient-fat" state="off" onClick={() => setEaten((e) => ({ protein: e.protein + 30, carbs: e.carbs + 110, fat: e.fat + 40 }))} />
          <Chip label="Reset" icon="arrow-up" token="nutrient-carbs" state="off" onClick={() => { setEaten({ protein: 44, carbs: 120, fat: 46 }); setRingKey((k) => k + 1); }} />
        </div>
      </Section>

      <Section title="Tip note" node="2675:6130">
        <div data-variant="tip">
          <TipNote linkLabel="See Recipe" onLink={() => {}}>
            Fiber is low today. Black Bean Tacos add 14 g if you cook them tonight.
          </TipNote>
        </div>
        <TipNote>Targets follow US dietary guidelines for your age and activity.</TipNote>
      </Section>

      <Section title="Targets row" node="2675:6140">
        <div data-variant="targets">
          <TargetsRow value="1,900 kcal" />
        </div>
        <TargetsRow value="Not set" set={false} />
      </Section>

      <Section title="Account card" node="2675:6150">
        <div data-variant="account">
          <AccountCard name="Priya Shah" />
        </div>
      </Section>

      <Section title="Tara card" node="2675:6269">
        <SegmentedControl
          label="Tara state"
          variant="pill"
          options={[
            { value: "online", label: "Online" },
            { value: "offline", label: "Offline" },
            { value: "not-set-up", label: "Not set up" },
          ]}
          value={tara}
          onChange={setTara}
        />
        <div className="flex flex-col gap-4" data-variant="tara">
          <TaraCard state="online" />
          <TaraCard state="offline" lastSeen="6:40 PM" />
          <TaraCard state="not-set-up" />
        </div>
      </Section>

      <Section title="Action sheet" node="2675:6280">
        <PrimaryButton onClick={() => setSheet(true)}>Show action sheet</PrimaryButton>
        <div className="relative h-[216px]" data-variant="sheet-static">
          <ActionSheet
            title="Sign out of Cravv?"
            message="Your recipes, Meal Log and Tara stay linked to your account."
            actions={[{ label: "Sign Out", destructive: true, onPress: () => {} }]}
            onCancel={() => {}}
            className="[&>div:first-child]:hidden"
          />
        </div>
      </Section>

      <Section title="Rating" node="2675:6349">
        <div className="flex flex-col gap-2" data-variant="rating">
          {[0, 1, 2, 3, 4, 5].map((v) => (
            <Rating key={v} value={v} />
          ))}
        </div>
        <Rating value={stars} onChange={setStars} size={28} />
      </Section>

      <Section title="Meal chip" node="2677:6228">
        <div className="grid grid-cols-3 justify-items-start gap-4" data-variant="meal-chips">
          {MEALS.map((m) => (
            <div key={m.id} className="contents">
              <MealChip meal={m.id} selected={false} />
              <Pressed>
                <MealChip meal={m.id} selected={false} />
              </Pressed>
              <MealChip meal={m.id} selected />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Filter button" node="2677:6231">
        <div className="flex items-center gap-10" data-variant="filter-buttons">
          <FilterButton />
          <Pressed>
            <FilterButton />
          </Pressed>
          <FilterButton count={2} />
          <FilterButton count={filters} onClick={() => setFilters((f) => (f + 1) % 5)} />
        </div>
      </Section>

      <Section title="Meal filter row" node="2677:6506">
        <div data-variant="meal-row-live">
          <MealFilterRow selected={meal} onSelect={setMeal} filterCount={filters} onFilters={() => setFilters((f) => (f + 1) % 5)} />
        </div>
        <p className="text-[15px] font-semibold">{meal ? "For tonight" : "Recipes for you"}</p>
        <div className="flex flex-col gap-3" data-variant="meal-rows-static">
          {([...MEALS.map((m) => m.id), null] as (MealId | null)[]).map((s) => (
            <div key={s ?? "none"} className="flex flex-col gap-3">
              <MealFilterRow selected={s} onSelect={() => {}} />
              <MealFilterRow selected={s} onSelect={() => {}} filterCount={2} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Filter chips" node="2680:6714 (Chip variant=filter)">
        <SectionTitle inset={false}>Course</SectionTitle>
        <div className="flex flex-wrap gap-2" data-variant="course-chips">
          {COURSES.map((c) => (
            <Chip key={c.id} {...c} variant="filter" state={courses.includes(c.id) ? "on" : "off"} onClick={() => setCourses(toggle(courses, c.id))} />
          ))}
        </div>
        <SectionTitle inset={false}>Cuisine</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <Chip key={c.id} {...c} variant="filter" state={c.id === "thai" ? "on" : "off"} />
          ))}
        </div>
        <SectionTitle inset={false}>More</SectionTitle>
        <div className="flex flex-wrap gap-2" data-variant="more-chips">
          {MORE.map((c) => (
            <Chip key={c.id} {...c} variant="filter" state={more.includes(c.id) ? "on" : "off"} onClick={() => setMore(toggle(more, c.id))} />
          ))}
        </div>
      </Section>

      <AnimatePresence>
        {sheet && (
          <div className="fixed inset-0 z-50">
            <ActionSheet
              title="Sign out of Cravv?"
              message="Your recipes, Meal Log and Tara stay linked to your account."
              actions={[{ label: "Sign Out", destructive: true, onPress: () => { setSignedOut((n) => n + 1); setSheet(false); } }]}
              onCancel={() => setSheet(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
