export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];
export const fallbackLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getBestLocale(header: string | null): Locale {
  if (!header) return fallbackLocale;
  const requested = header
    .split(",")
    .map((entry) => entry.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const value of requested) {
    const base = value.split("-")[0];
    if (isLocale(base)) return base;
  }
  return fallbackLocale;
}
