export type BaseThemeMode = "system" | "light" | "dark";
export type CustomThemeId = "dotmoe" | "tet" | "winter";
export type UserThemeSelection = BaseThemeMode | CustomThemeId;
export type AppliedCustomThemeId = CustomThemeId | "none";

export interface ThemeConfig {
  defaultSelection: UserThemeSelection;
}

export type ThemeAvailability =
  | { type: "always" }
  | { type: "manual"; enabled: boolean }
  | {
      type: "gregorian-range";
      timezone: string;
      start: { month: number; day: number };
      end: { month: number; day: number };
    };

export interface ThemeDecorationConfig {
  enabled: boolean;
  type: "none" | "snow" | "fireflies" | "blossoms" | "dots";
  intensity: "low" | "medium";
}

export interface ThemeParticleConfig {
  enabled: boolean;
  disableOnMobile?: boolean;
  respectReducedMotion: boolean;
  preset?: "none" | "snow" | "fireflies" | "blossoms" | "dots";
  options?: ISourceOptions;
}

export interface ThemeTokens {
  background: string;
  foreground: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  accent: string;
  accentMuted: string;
  secondaryAccent: string;
  selection: string;
  gridOpacity: string;
  decorationOpacity: string;
}

export interface CustomThemeDefinition {
  id: CustomThemeId;
  label: string;
  description: string;
  enabled: boolean;
  availability: ThemeAvailability;
  tokens: ThemeTokens;
  decoration?: ThemeDecorationConfig;
  particles?: ThemeParticleConfig;
  atmosphereCss?: string;
  metadata?: {
    sidebarStatus?: string;
    sidebarThemeLabel?: string;
    seasonLabel?: string;
  };
}
import type { ISourceOptions } from "@tsparticles/engine";
