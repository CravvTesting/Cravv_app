/* Cravv component library (onboarding + tabs). See README.md for the API table. */
export { Icon, ICON_NAMES, type IconName, type IconProps } from "./Icon";
export * from "./options";
export { Chip, type ChipProps, type ChipState } from "./Chip";
export { ChoiceTile, ChoiceTileGroup, type ChoiceTileProps } from "./ChoiceTile";
export { InfoTile, type InfoTileProps } from "./InfoTile";
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from "./SegmentedControl";
export { StepProgress, type StepProgressProps } from "./StepProgress";
export { StatusPill, type StatusTone } from "./StatusPill";
export { TextField, type TextFieldProps } from "./TextField";
export { ListRow, ListGroup, type ListRowProps } from "./ListRow";
export { SheetHeader, type SheetHeaderProps } from "./SheetHeader";
export {
  CalibrationResult,
  CalibrationProgress,
  calibrationOutcome,
  type CalibrationOutcome,
  type CalibrationResultProps,
  type CalibrationProgressProps,
} from "./Calibration";
export { SetupStep, SetupStepStrip, type SetupStepProps } from "./SetupStep";
export { Viewfinder, type ViewfinderProps } from "./Viewfinder";
export { Callout } from "./Callout";
export { StovePreview, StovePlan, STOVE_LAYOUTS, type StovePreviewProps } from "./StovePreview";
export { PrimaryButton, TextButton, GlassButton, BackButton, CloseButton, type PrimaryButtonProps } from "./Buttons";
export { Spinner, type SpinnerProps } from "./Spinner";
export { SectionTitle } from "./SectionTitle";
export { BloomFill, useBloomOrigin } from "./Bloom";
export { cx, PRESS } from "./utils";

/* Components · Tabs */
export { TabBar, TAB_BAR_HEIGHT, TAB_BAR_INSET, type TabBarProps } from "./TabBar";
export { CookingMiniBar, MINI_BAR_HEIGHT, MINI_BAR_GAP, type CookingMiniBarProps } from "./CookingMiniBar";
export { Switch, type SwitchProps } from "./Switch";
export {
  SettingsRow,
  SettingsGroup,
  SettingsChevron,
  RowSeparator,
  type SettingsRowProps,
  type SettingsRowType,
  type SettingsGroupProps,
} from "./Settings";
export { MealRow, DayHeader, type MealRowProps, type MealRowType, type DayHeaderProps } from "./MealRow";
export {
  NutrientRow,
  MacroRingCard,
  TipNote,
  TargetsRow,
  ProgressBar,
  type NutrientRowProps,
  type MacroRingCardProps,
  type TipNoteProps,
  type TargetsRowProps,
} from "./Nutrition";
export { AccountCard, TaraCard, type AccountCardProps, type TaraCardProps, type TaraState } from "./Profile";
export { ActionSheet, type ActionSheetProps, type ActionSheetAction } from "./ActionSheet";
export { Rating, type RatingProps } from "./Rating";
export {
  MealChip,
  FilterButton,
  MealFilterRow,
  type MealChipProps,
  type FilterButtonProps,
  type MealFilterRowProps,
} from "./MealFilter";
export { useCountUp, formatNumber } from "./useCountUp";
