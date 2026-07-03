import { activeTheme, enabledCustomThemes } from "./theme.config";
import type { CustomThemeId, UserThemeSelection } from "./theme.types";

export const themeStorageKey = "lou-theme-mode";
export const baseThemeSelections = ["system", "light", "dark"] as const;
export const customThemeSelections = enabledCustomThemes.map(
  (theme) => theme.id,
) as CustomThemeId[];
export const allThemeSelections: UserThemeSelection[] = [
  ...baseThemeSelections,
  ...customThemeSelections,
];

export function isThemeSelection(value: string | null): value is UserThemeSelection {
  return typeof value === "string" && allThemeSelections.includes(value as UserThemeSelection);
}

export function getStoredTheme(): UserThemeSelection {
  if (typeof window === "undefined") return activeTheme.defaultSelection;
  const stored = window.localStorage.getItem(themeStorageKey);
  return isThemeSelection(stored) ? stored : activeTheme.defaultSelection;
}

export function storeTheme(selection: UserThemeSelection) {
  window.localStorage.setItem(themeStorageKey, selection);
}
