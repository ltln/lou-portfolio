import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { customThemeDefinitions } from "@/features/theme/theme.config";
import { isAvailabilityActive } from "@/features/theme/theme.availability";
import type { CustomThemeDefinition, CustomThemeId } from "@/features/theme/theme.types";

export const dynamic = "force-dynamic";

type HeroTheme = "dark" | CustomThemeId;

const defaultTheme: HeroTheme = "dark";
const defaultHeroImage = "hero/dark.svg";
const queryThemeAliases: Record<string, HeroTheme> = {
  dark: "dark",
  moe: "dotmoe",
  dotmoe: "dotmoe",
  "dot.moe": "dotmoe",
  monsoon: "monsoon",
  midautumn: "midautumn",
  tet: "lunar-new-year",
  lunar: "lunar-new-year",
  "lunar-new-year": "lunar-new-year",
  aurora: "aurora",
  sakura: "cherry-blossom",
  "cherry-blossom": "cherry-blossom",
  halloween: "halloween",
  "terminal-green": "terminal-green",
  terminal: "terminal-green",
  blueprint: "midnight-blueprint",
  "midnight-blueprint": "midnight-blueprint",
  winter: "winter",
};

export async function GET(request: NextRequest) {
  const queryTheme = request.nextUrl.searchParams.get("theme");
  const random = isRandomQueryTheme(queryTheme);
  const theme = random ? randomHeroTheme() : resolveHeroTheme(queryTheme);
  const svg = await fs.readFile(path.join(process.cwd(), "public", heroImageFor(theme)), "utf8");

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": cacheControlHeader(random),
      "X-Hero-Theme": theme,
    },
  });
}

function resolveHeroTheme(queryTheme: string | null): HeroTheme {
  const requested = normalizeQueryTheme(queryTheme);
  if (requested && isHeroThemeEnabled(requested)) return requested;

  const activeTheme = customThemeDefinitions
    .filter((theme) => theme.enabled && isHeroActive(theme))
    .sort((left, right) => heroPriority(right) - heroPriority(left))[0];

  return activeTheme?.id ?? defaultTheme;
}

function normalizeQueryTheme(theme: string | null): HeroTheme | null {
  if (!theme) return null;
  return queryThemeAliases[theme.trim().toLowerCase()] ?? null;
}

function isRandomQueryTheme(theme: string | null) {
  return theme?.trim().toLowerCase() === "random";
}

function randomHeroTheme(): HeroTheme {
  const themes = customThemeDefinitions
    .filter((theme) => theme.enabled && theme.hero?.image)
    .map((theme) => theme.id);
  if (!themes.length) return defaultTheme;
  return themes[Math.floor(Math.random() * themes.length)] ?? defaultTheme;
}

function isHeroThemeEnabled(theme: HeroTheme) {
  if (theme === "dark") return true;
  return Boolean(themeDefinition(theme)?.enabled && themeDefinition(theme)?.hero?.image);
}

function isHeroActive(theme: CustomThemeDefinition) {
  if (!theme.hero?.image) return false;
  const availability = theme.hero.availability ?? theme.availability;
  if (availability.type === "always") return false;
  return isAvailabilityActive(availability);
}

function heroPriority(theme: CustomThemeDefinition) {
  return theme.hero?.priority ?? 0;
}

function heroImageFor(theme: HeroTheme) {
  if (theme === "dark") return defaultHeroImage;
  return themeDefinition(theme)?.hero?.image ?? defaultHeroImage;
}

function themeDefinition(theme: CustomThemeId) {
  return customThemeDefinitions.find((definition) => definition.id === theme);
}

function cacheControlHeader(noStore = false) {
  if (noStore) return "no-store";
  const seconds = cacheSeconds();
  return `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${seconds}`;
}

function cacheSeconds() {
  const value = Number(process.env.HERO_CACHE_SECONDS ?? 3600);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
}
