import type { ContentEntry } from "@/content/mdx/loader";
import { normalizeSearch } from "./normalize-search";

export function includesTitle(entry: ContentEntry, query: string) {
  const normalized = normalizeSearch(query);
  if (!normalized) return true;
  return normalizeSearch(entry.frontmatter.title).includes(normalized);
}

export function hasAny(values: string[], selected: string[]) {
  if (!selected.length) return true;
  const normalizedValues = values.map(normalizeSearch);
  return selected.some((item) => normalizedValues.includes(normalizeSearch(item)));
}

export function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function entryMonth(entry: ContentEntry) {
  return entry.frontmatter.date.slice(0, 7);
}

export function entryYear(entry: ContentEntry) {
  return entry.frontmatter.date.slice(0, 4);
}

export function inRange(value: string, from?: string, to?: string) {
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export function parseCsv(value: string | null) {
  return value ? value.split(",").map(decodeURIComponent).filter(Boolean) : [];
}

export function serializeCsv(values: string[]) {
  return values.length ? values.map(encodeURIComponent).join(",") : null;
}
