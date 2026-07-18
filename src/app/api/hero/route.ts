import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { customThemeDefinitions } from "@/features/theme/theme.config";
import { isAvailabilityActive } from "@/features/theme/theme.availability";
import type { CustomThemeId } from "@/features/theme/theme.types";

export const dynamic = "force-dynamic";

type HeroTheme = "dark" | CustomThemeId;

const defaultTheme: HeroTheme = "dark";
const heroFiles: Record<HeroTheme, string> = {
  dark: "hero/dark.svg",
  dotmoe: "hero/moe.svg",
  tet: "hero/tet.svg",
  winter: "hero/winter.svg",
};
const queryThemeAliases: Record<string, HeroTheme> = {
  dark: "dark",
  moe: "dotmoe",
  dotmoe: "dotmoe",
  "dot.moe": "dotmoe",
  tet: "tet",
  winter: "winter",
};

export async function GET(request: NextRequest) {
  const theme = resolveHeroTheme(request.nextUrl.searchParams.get("theme"));
  const svg = await fs.readFile(path.join(process.cwd(), "public", heroFiles[theme]), "utf8");

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": cacheControlHeader(),
      "X-Hero-Theme": theme,
    },
  });
}

function resolveHeroTheme(queryTheme: string | null): HeroTheme {
  const requested = normalizeQueryTheme(queryTheme);
  if (requested && isHeroThemeEnabled(requested)) return requested;

  const activeTheme = customThemeDefinitions.find(
    (theme) =>
      theme.enabled &&
      theme.availability.type !== "always" &&
      isAvailabilityActive(theme.availability),
  );

  return activeTheme?.id ?? defaultTheme;
}

function normalizeQueryTheme(theme: string | null): HeroTheme | null {
  if (!theme) return null;
  return queryThemeAliases[theme.trim().toLowerCase()] ?? null;
}

function isHeroThemeEnabled(theme: HeroTheme) {
  if (theme === "dark") return true;
  return customThemeDefinitions.some((definition) => definition.id === theme && definition.enabled);
}

function cacheControlHeader() {
  const seconds = cacheSeconds();
  return `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${seconds}`;
}

function cacheSeconds() {
  const value = Number(process.env.HERO_CACHE_SECONDS ?? 3600);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 3600;
}
