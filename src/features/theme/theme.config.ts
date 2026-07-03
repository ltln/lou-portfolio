import type { CustomThemeDefinition, ThemeConfig } from "./theme.types";

export const activeTheme: ThemeConfig = {
  defaultSelection: "system",
};

export const decorationsEnabled = true;
export const particlesEnabled = true;

export const customThemeDefinitions: CustomThemeDefinition[] = [
  {
    id: "dotmoe",
    label: "dot.moe",
    description: "Muted magenta accent with drifting dot decoration support.",
    enabled: true,
    availability: { type: "always" },
    tokens: {
      background: "247 247 244",
      foreground: "25 29 31",
      surface: "239 240 236",
      surfaceMuted: "232 234 230",
      border: "205 209 204",
      accent: "171 96 155",
      accentMuted: "241 221 237",
      secondaryAccent: "110 128 210",
      selection: "238 211 233",
      gridOpacity: "0.42",
      decorationOpacity: "0.24",
    },
    decoration: { enabled: true, type: "dots", intensity: "low" },
    particles: {
      enabled: true,
      preset: "dots",
      disableOnMobile: true,
      respectReducedMotion: true,
      options: {
        particles: { color: { value: ["#ab609b", "#c6a0ff"] }, opacity: { value: 0.18 } },
      },
    },
    atmosphereCss:
      "body::after{opacity:1;background:radial-gradient(circle at 84% 8%,rgb(255 143 199 / 0.16),transparent 32rem),radial-gradient(circle at 12% 88%,rgb(198 160 255 / 0.12),transparent 30rem);}",
    metadata: { sidebarStatus: "ONLINE", sidebarThemeLabel: "DOT.MOE" },
  },
  {
    id: "tet",
    label: "Tet Build",
    description: "Warm crimson, cream, muted gold, and ink for a spring release workspace.",
    enabled: true,
    availability: { type: "manual", enabled: false },
    tokens: {
      background: "27 17 18",
      foreground: "255 247 232",
      surface: "41 23 25",
      surfaceMuted: "55 31 31",
      border: "92 54 48",
      accent: "223 75 63",
      accentMuted: "217 170 89",
      secondaryAccent: "242 200 112",
      selection: "97 39 37",
      gridOpacity: "0.22",
      decorationOpacity: "0.18",
    },
    decoration: { enabled: true, type: "blossoms", intensity: "low" },
    particles: {
      enabled: true,
      preset: "blossoms",
      disableOnMobile: true,
      respectReducedMotion: true,
    },
    metadata: {
      sidebarStatus: "LUCKY DEPLOYMENT",
      sidebarThemeLabel: "TET BUILD",
      seasonLabel: "SPRING RELEASE",
    },
  },
  {
    id: "winter",
    label: "Winter Deploy",
    description: "Quiet midnight deployment theme with icy blue, pine, and soft red accents.",
    enabled: true,
    availability: {
      type: "gregorian-range",
      timezone: "Asia/Ho_Chi_Minh",
      start: { month: 12, day: 1 },
      end: { month: 1, day: 7 },
    },
    tokens: {
      background: "9 18 28",
      foreground: "238 247 255",
      surface: "16 31 45",
      surfaceMuted: "21 40 57",
      border: "41 68 91",
      accent: "143 211 255",
      accentMuted: "155 215 189",
      secondaryAccent: "233 132 132",
      selection: "29 71 94",
      gridOpacity: "0.24",
      decorationOpacity: "0.16",
    },
    decoration: { enabled: true, type: "snow", intensity: "low" },
    particles: {
      enabled: true,
      preset: "snow",
      disableOnMobile: true,
      respectReducedMotion: true,
    },
    metadata: {
      sidebarStatus: "ALL SYSTEMS COZY",
      sidebarThemeLabel: "WINTER DEPLOY",
      seasonLabel: "YEAR-END RELEASE",
    },
  },
];

export const enabledCustomThemes = customThemeDefinitions.filter((theme) => theme.enabled);
