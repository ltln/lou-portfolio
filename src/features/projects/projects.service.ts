import { getEntry, getLocalizedEntries, getStaticSlugs } from "@/content/mdx/loader";
import type { Locale } from "@/i18n/config";

export const getProjects = (locale: Locale) => getLocalizedEntries("projects", locale);
export const getProject = (locale: Locale, slug: string) => getEntry("projects", locale, slug);
export const getFeaturedProjects = (locale: Locale) =>
  getProjects(locale).filter((entry) => entry.frontmatter.featured);
export const getProjectStaticParams = () => getStaticSlugs("projects");
