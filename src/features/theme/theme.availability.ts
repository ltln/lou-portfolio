import { customThemeDefinitions } from "./theme.config";
import type { CustomThemeId, ThemeAvailability } from "./theme.types";

const alwaysAvailable: CustomThemeId[] = ["dotmoe"];

function exposesAllEnabledThemes() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  const vercelEnv = process.env.VERCEL_ENV;
  return (
    process.env.NEXT_PUBLIC_THEME_ENABLE_ALL === "true" ||
    process.env.NODE_ENV !== "production" ||
    appEnv === "development" ||
    appEnv === "dev" ||
    appEnv === "stage" ||
    appEnv === "staging" ||
    appEnv === "test" ||
    vercelEnv === "development" ||
    vercelEnv === "preview"
  );
}

function dateParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  return {
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function monthDayValue(value: { month: number; day: number }) {
  return value.month * 100 + value.day;
}

export function isAvailabilityActive(availability: ThemeAvailability, now = new Date()) {
  if (availability.type === "always") return true;
  if (availability.type === "manual") return availability.enabled;
  const today = monthDayValue(dateParts(now, availability.timezone));
  const start = monthDayValue(availability.start);
  const end = monthDayValue(availability.end);
  return start <= end ? today >= start && today <= end : today >= start || today <= end;
}

export function availableCustomThemes(now = new Date()) {
  if (exposesAllEnabledThemes()) return customThemeDefinitions.filter((theme) => theme.enabled);
  const preview =
    process.env.NODE_ENV !== "production" ? process.env.NEXT_PUBLIC_THEME_PREVIEW : undefined;
  return customThemeDefinitions.filter(
    (theme) =>
      theme.enabled &&
      (alwaysAvailable.includes(theme.id) ||
        isAvailabilityActive(theme.availability, now) ||
        preview === theme.id),
  );
}

export function serverSafeAvailableCustomThemes() {
  if (exposesAllEnabledThemes()) return customThemeDefinitions.filter((theme) => theme.enabled);
  const preview =
    process.env.NODE_ENV !== "production" ? process.env.NEXT_PUBLIC_THEME_PREVIEW : undefined;
  return customThemeDefinitions.filter(
    (theme) =>
      theme.enabled &&
      (alwaysAvailable.includes(theme.id) ||
        theme.availability.type === "always" ||
        (theme.availability.type === "manual" && theme.availability.enabled) ||
        preview === theme.id),
  );
}

export function isThemeAvailable(id: CustomThemeId, now = new Date()) {
  return availableCustomThemes(now).some((theme) => theme.id === id);
}
