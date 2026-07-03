import { getEntry, getLocalizedEntries, getStaticSlugs } from "@/content/mdx/loader";
import type { Locale } from "@/i18n/config";

export const getNotes = (locale: Locale) => getLocalizedEntries("notes", locale);
export const getNote = (locale: Locale, slug: string) => getEntry("notes", locale, slug);
export const getNoteStaticParams = () => getStaticSlugs("notes");
