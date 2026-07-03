import en from "./messages/en.json";
import vi from "./messages/vi.json";
import { fallbackLocale, type Locale } from "./config";

const dictionaries = { en, vi } as const;
export type Messages = typeof en;

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[fallbackLocale];
}

export function t(locale: Locale) {
  const messages = getMessages(locale);
  return function translate(path: string): string {
    return path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object" && key in acc)
        return (acc as Record<string, unknown>)[key];
      return path;
    }, messages) as string;
  };
}
