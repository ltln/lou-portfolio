import type { Locale } from "@/i18n/config";
import type { PageFrontmatter } from "./page-content.schema";

export type PageSlug = "home" | "about";

export interface PageContentEntry {
  slug: PageSlug;
  locale: Locale;
  fallback: boolean;
  frontmatter: PageFrontmatter;
  body: string;
}
