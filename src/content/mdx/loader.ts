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
const warnedInvalidFiles = new Set<string>();
const htmlTagAllowlist = new Set([
  "a",
  "abbr",
  "aside",
  "audio",
  "br",
  "button",
  "code",
  "dd",
  "details",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "iframe",
  "img",
  "input",
  "kbd",
  "label",
  "li",
  "mark",
  "meter",
  "ol",
  "option",
  "p",
  "progress",
  "samp",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "textarea",
  "ul",
  "var",
  "video",
]);

function dirFor(kind: ContentKind) {
  return path.join(root, kind);
}

export function getAllEntries(kind: ContentKind): ContentEntry[] {
  const dir = dirFor(kind);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) => {
      const entry = readFileSafe(kind, file);
      return entry?.frontmatter.published ? [entry] : [];
    })
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date));
}

function readFileSafe(kind: ContentKind, file: string): ContentEntry | null {
  try {
    return readFile(kind, file);
  } catch (error) {
    warnInvalidFile(`${kind}/${file}`, error);
    return null;
  }
}

function warnInvalidFile(key: string, error: unknown) {
  if (warnedInvalidFiles.has(key)) return;
  warnedInvalidFiles.add(key);
  console.warn(`Skipping invalid content file: ${key} (${messageFromError(error)})`);
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function readFile(kind: ContentKind, file: string): ContentEntry {
  const match = filenamePattern.exec(file);
  if (!match) throw new Error(`Invalid MDX filename: ${file}`);
  const [, , slug, locale] = match;
  const raw = fs.readFileSync(path.join(dirFor(kind), file), "utf8");
  const parsed = matter(raw);
  const body = normalizeMdxSource(parsed.content);
  const frontmatter = frontmatterSchema.parse(parsed.data);
  const canonicalSlug = frontmatter.translationOf ?? slug;
  return {
    kind,
    slug,
    canonicalSlug,
    locale: locale as Locale,
    fallback: false,
    frontmatter,
    body,
    readingMinutes: Math.max(1, Math.ceil(readingTime(body).minutes)),
  };
}

export function normalizeMdxSource(source: string) {
  const lines = source.split(/\r?\n/);
  let inFence = false;
  return lines
    .flatMap((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      if (/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(line)) return [];

      const sanitized = sanitizeMdxHtmlLine(line);
      const escaped = sanitized.replace(/<\/?([a-z][\w-]*)(\s[^<>]*)?>/g, (match, tag: string) => {
        return htmlTagAllowlist.has(tag)
          ? match
          : match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      });

      const multilineClose = escaped.match(/^(.*\S)\s+(<\/[A-Z][A-Za-z0-9_]*>)\s*$/);
      return multilineClose ? [multilineClose[1], multilineClose[2]] : escaped;
    })
    .join("\n");
}

function sanitizeMdxHtmlLine(line: string) {
  return line
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]+)/gi, "")
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "")
    .replace(/\s+(href|src)\s*=\s*\{\s*[`'"]\s*javascript:[^}]*\}/gi, "");
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
