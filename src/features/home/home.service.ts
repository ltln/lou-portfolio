import type { Locale } from "@/i18n/config";
import { getNotes } from "@/features/notes/notes.service";
import { getFeaturedProjects } from "@/features/projects/projects.service";

export function getHomeData(locale: Locale) {
  return {
    projects: getFeaturedProjects(locale).slice(0, 3),
    notes: getNotes(locale).slice(0, 3),
  };
}
