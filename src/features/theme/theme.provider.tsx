"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { activeTheme } from "./theme.config";
import {
  availableCustomThemes,
  isThemeAvailable,
  serverSafeAvailableCustomThemes,
} from "./theme.availability";
import { getStoredTheme, storeTheme } from "./theme.storage";
import type { CustomThemeDefinition, UserThemeSelection } from "./theme.types";
import { isBaseThemeMode, resolveThemeSelection } from "./theme.utils";

interface ThemeContextValue {
  selection: UserThemeSelection;
  setSelection: (selection: UserThemeSelection) => void;
  availableThemes: CustomThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<UserThemeSelection>(activeTheme.defaultSelection);
  const [availableThemes, setAvailableThemes] = useState<CustomThemeDefinition[]>(() =>
    serverSafeAvailableCustomThemes(),
  );
  const [hydrated, setHydrated] = useState(false);
  const appliedOnce = useRef(false);

  useEffect(() => {
    const themes = availableCustomThemes();
    setAvailableThemes(themes);
    const stored = getStoredTheme();
    window.localStorage.removeItem("lou-sidebar-collapsed");
    const next =
      !isBaseThemeMode(stored) && !isThemeAvailable(stored) ? activeTheme.defaultSelection : stored;
    setSelection(next);
    if (next !== stored) storeTheme(next);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const resolved = resolveThemeSelection(selection);
    if (appliedOnce.current) {
      root.dataset.themeTransitioning = "true";
      window.setTimeout(() => {
        delete root.dataset.themeTransitioning;
      }, 260);
    }
    root.dataset.themeMode = resolved.themeMode;
    root.dataset.customTheme = resolved.customTheme;
    storeTheme(selection);
    appliedOnce.current = true;
  }, [hydrated, selection]);

  return (
    <ThemeContext.Provider value={{ selection, setSelection, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}
