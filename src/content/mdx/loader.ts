import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { fallbackLocale, type Locale } from "@/i18n/config";
import { frontmatterSchema, type Frontmatter } from "@/content/schemas/frontmatter";

export type ContentKind = "notes" | "projects";

export interface ContentEntry {
  kind: ContentKind;
  slug: string;
  canonicalSlug: string;
  locale: Locale;
  fallback: boolean;
  frontmatter: Frontmatter;
  body: string;
  readingMinutes: number;
}

const root = path.join(process.cwd(), "content");
const filenamePattern = /^(\d{4}-\d{2}-\d{2})_(.+)\.(en|vi)\.mdx$/;

function dirFor(kind: ContentKind) {
  return path.join(root, kind);
}

export function getAllEntries(kind: ContentKind): ContentEntry[] {
  const dir = dirFor(kind);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readFile(kind, file))
    .filter((entry) => entry.frontmatter.published)
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

function readFile(kind: ContentKind, file: string): ContentEntry {
  const match = filenamePattern.exec(file);
  if (!match) throw new Error(`Invalid MDX filename: ${file}`);
  const [, , slug, locale] = match;
  const raw = fs.readFileSync(path.join(dirFor(kind), file), "utf8");
  const parsed = matter(raw);
  const frontmatter = frontmatterSchema.parse(parsed.data);
  const canonicalSlug = frontmatter.translationOf ?? slug;
  return {
    kind,
    slug,
    canonicalSlug,
    locale: locale as Locale,
    fallback: false,
    frontmatter,
    body: parsed.content,
    readingMinutes: Math.max(1, Math.ceil(readingTime(parsed.content).minutes)),
  };
}

export function getLocalizedEntries(kind: ContentKind, locale: Locale) {
  const entries = getAllEntries(kind);
  const groups = new Map<string, ContentEntry[]>();
  for (const entry of entries) {
    const key = entry.canonicalSlug;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return Array.from(groups.values())
    .map((group) => resolveGroup(group, locale))
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

function resolveGroup(group: ContentEntry[], locale: Locale): ContentEntry {
  const exact = group.find((entry) => entry.locale === locale);
  if (exact) return exact;
  const fallback = group.find((entry) => entry.locale === fallbackLocale) ?? group[0];
  return { ...fallback, fallback: true };
}

export function getEntry(kind: ContentKind, locale: Locale, slug: string): ContentEntry | null {
  const entries = getAllEntries(kind);
  const group = entries.filter((entry) => entry.canonicalSlug === slug || entry.slug === slug);
  if (!group.length) return null;
  return resolveGroup(group, locale);
}

export function getStaticSlugs(kind: ContentKind) {
  return getAllEntries(kind).map((entry) => ({ lang: entry.locale, slug: entry.canonicalSlug }));
}

export function getAlternateSlug(kind: ContentKind, currentSlug: string, targetLocale: Locale) {
  const entries = getAllEntries(kind);
  const group = entries.filter(
    (entry) => entry.canonicalSlug === currentSlug || entry.slug === currentSlug,
  );
  return (
    group.find((entry) => entry.locale === targetLocale)?.canonicalSlug ??
    group.find((entry) => entry.locale === fallbackLocale)?.canonicalSlug
  );
}
