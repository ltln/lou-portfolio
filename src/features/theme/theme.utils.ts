import { enabledCustomThemes } from "./theme.config";
import type {
  AppliedCustomThemeId,
  BaseThemeMode,
  ThemeDecorationConfig,
  ThemeParticleConfig,
  UserThemeSelection,
} from "./theme.types";

export function isBaseThemeMode(selection: UserThemeSelection): selection is BaseThemeMode {
  return selection === "system" || selection === "light" || selection === "dark";
}

export function resolveThemeSelection(selection: UserThemeSelection): {
  themeMode: BaseThemeMode;
  customTheme: AppliedCustomThemeId;
} {
  if (isBaseThemeMode(selection)) return { themeMode: selection, customTheme: "none" };
  return { themeMode: "system", customTheme: selection };
}

export function labelForTheme(selection: UserThemeSelection) {
  if (selection === "system") return "System";
  if (selection === "light") return "Light";
  if (selection === "dark") return "Dark";
  return enabledCustomThemes.find((theme) => theme.id === selection)?.label ?? selection;
}

export function getDecorationConfig(
  selection: UserThemeSelection,
  decorationsEnabled: boolean,
): ThemeDecorationConfig {
  if (!decorationsEnabled) return { enabled: false, type: "none", intensity: "low" };
  if (isBaseThemeMode(selection)) return { enabled: false, type: "none", intensity: "low" };
  const definition = enabledCustomThemes.find((theme) => theme.id === selection);
  return definition?.decoration ?? { enabled: false, type: "none", intensity: "low" };
}

export function getParticleConfig(
  selection: UserThemeSelection,
  particlesEnabled: boolean,
): ThemeParticleConfig {
  if (!particlesEnabled || isBaseThemeMode(selection)) {
    return { enabled: false, preset: "none", respectReducedMotion: true };
  }
  const definition = enabledCustomThemes.find((theme) => theme.id === selection);
  return definition?.particles ?? { enabled: false, preset: "none", respectReducedMotion: true };
}

export function metadataForTheme(selection: UserThemeSelection) {
  if (isBaseThemeMode(selection)) return null;
  return enabledCustomThemes.find((theme) => theme.id === selection)?.metadata ?? null;
}

export function customThemeCss() {
  return enabledCustomThemes
    .map((theme) => {
      const tokens = theme.tokens;
      return `html[data-custom-theme="${theme.id}"]{--background:${tokens.background};--foreground:${tokens.foreground};--surface:${tokens.surface};--surface-muted:${tokens.surfaceMuted};--border:${tokens.border};--accent:${tokens.accent};--accent-muted:${tokens.accentMuted};--secondary-accent:${tokens.secondaryAccent};--selection:${tokens.selection};--grid-opacity:${tokens.gridOpacity};--decoration-opacity:${tokens.decorationOpacity};}${theme.atmosphereCss ? `html[data-custom-theme="${theme.id}"] ${theme.atmosphereCss}` : ""}`;
    })
    .join("\n");
}
