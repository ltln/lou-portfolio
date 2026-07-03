import type { ContentEntry } from "@/content/mdx/loader";
import {
  entryMonth,
  hasAny,
  includesTitle,
  inRange,
  uniqueSorted,
} from "@/features/content-filter/filter-utils";
import type { Locale } from "@/i18n/config";

export interface NotesFilterState {
  q: string;
  tags: string[];
  from: string;
  to: string;
}

export function filterNotes(notes: ContentEntry[], filters: NotesFilterState) {
  return notes.filter(
    (note) =>
      includesTitle(note, filters.q) &&
      hasAny(note.frontmatter.tags, filters.tags) &&
      inRange(entryMonth(note), filters.from, filters.to),
  );
}

export function noteTagOptions(notes: ContentEntry[]) {
  return uniqueSorted(notes.flatMap((note) => note.frontmatter.tags));
}

export function noteMonthOptions(notes: ContentEntry[], locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  });
  return uniqueSorted(notes.map(entryMonth)).map((month) => ({
    value: month,
    label: formatter.format(new Date(`${month}-01T00:00:00Z`)),
  }));
}
