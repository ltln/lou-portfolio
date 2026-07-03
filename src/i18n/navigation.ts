import type { Locale } from "./config";

export type RouteKey = "home" | "projects" | "notes" | "about";

export function routeFor(locale: Locale, key: RouteKey): string {
  const map: Record<RouteKey, string> = {
    home: `/${locale}`,
    projects: `/${locale}/projects`,
    notes: `/${locale}/notes`,
    about: `/${locale}/about`,
  };
  return map[key];
}

export function localizedDetail(locale: Locale, type: "projects" | "notes", slug: string): string {
  return `/${locale}/${type}/${slug}`;
}
