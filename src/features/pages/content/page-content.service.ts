import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { fallbackLocale, type Locale } from "@/i18n/config";
import { pageContentSchema } from "./page-content.schema";
import type { PageContentEntry, PageSlug } from "./page-content.types";

const pagesRoot = path.join(process.cwd(), "content", "pages");
const warnedInvalidPages = new Set<string>();

export function getPageContent(locale: Locale, slug: PageSlug): PageContentEntry | null {
  const exact = readPage(locale, slug, false);
  if (exact) return exact;
  return readPage(fallbackLocale, slug, true);
}

function readPage(locale: Locale, slug: PageSlug, fallback: boolean): PageContentEntry | null {
  const filePath = path.join(pagesRoot, `${slug}.${locale}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const parsed = matter(fs.readFileSync(filePath, "utf8"));
    const frontmatter = pageContentSchema.parse(parsed.data);
    if (!frontmatter.published) return null;
    return {
      slug,
      locale,
      fallback,
      frontmatter,
      body: parsed.content,
    };
  } catch (error) {
    warnInvalidPage(`${slug}.${locale}.mdx`, error);
    return null;
  }
}

function warnInvalidPage(file: string, error: unknown) {
  if (warnedInvalidPages.has(file)) return;
  warnedInvalidPages.add(file);
  console.warn(`Skipping invalid page content file: ${file} (${messageFromError(error)})`);
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
