import { activeTheme, enabledCustomThemes } from "../theme.config";
import { themeStorageKey } from "../theme.storage";

export function ThemeScript() {
  const exposeAllThemes = process.env.NEXT_PUBLIC_THEME_ENABLE_ALL === "true";
  const preview =
    process.env.NODE_ENV !== "production" ? process.env.NEXT_PUBLIC_THEME_PREVIEW : undefined;
  const customThemes = exposeAllThemes
    ? enabledCustomThemes.map((theme) => theme.id)
    : ["dotmoe", ...(preview === "winter" || preview === "tet" ? [preview] : [])];
  const allowedThemes = ["system", "light", "dark", ...customThemes];
  const code = `
    (() => {
      const key = ${JSON.stringify(themeStorageKey)};
      const fallback = ${JSON.stringify(activeTheme.defaultSelection)};
      const allowed = new Set(${JSON.stringify(allowedThemes)});
      const custom = new Set(${JSON.stringify(customThemes)});
      const stored = window.localStorage.getItem(key);
      const selection = allowed.has(stored) ? stored : fallback;
      const root = document.documentElement;
      root.dataset.themeMode = custom.has(selection) ? "system" : selection;
      root.dataset.customTheme = custom.has(selection) ? selection : "none";
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
