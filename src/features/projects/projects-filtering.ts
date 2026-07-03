import type { ContentEntry } from "@/content/mdx/loader";
import {
  entryYear,
  hasAny,
  includesTitle,
  inRange,
  uniqueSorted,
} from "@/features/content-filter/filter-utils";

export interface ProjectsFilterState {
  q: string;
  tags: string[];
  stack: string[];
  focus: string[];
  from: string;
  to: string;
}

export function filterProjects(projects: ContentEntry[], filters: ProjectsFilterState) {
  return projects.filter(
    (project) =>
      includesTitle(project, filters.q) &&
      hasAny(project.frontmatter.tags, filters.tags) &&
      hasAny(project.frontmatter.stack, filters.stack) &&
      hasAny(project.frontmatter.focus, filters.focus) &&
      inRange(entryYear(project), filters.from, filters.to),
  );
}

export function projectFilterOptions(projects: ContentEntry[]) {
  return {
    tags: uniqueSorted(projects.flatMap((project) => project.frontmatter.tags)),
    stack: uniqueSorted(projects.flatMap((project) => project.frontmatter.stack)),
    focus: uniqueSorted(projects.flatMap((project) => project.frontmatter.focus)),
    years: uniqueSorted(projects.map(entryYear)).map((year) => ({ value: year, label: year })),
  };
}
