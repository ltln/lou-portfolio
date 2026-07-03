"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { ContentEntry } from "@/content/mdx/loader";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";
import { parseCsv, serializeCsv } from "@/features/content-filter/filter-utils";
import { ActiveFilterChips } from "@/features/content-filter/components/ActiveFilterChips";
import { ContentSearchInput } from "@/features/content-filter/components/ContentSearchInput";
import { DateRangeFilter } from "@/features/content-filter/components/DateRangeFilter";
import { MultiSelectFilter } from "@/features/content-filter/components/MultiSelectFilter";
import { ProjectList } from "./ProjectList";
import {
  filterProjects,
  projectFilterOptions,
  type ProjectsFilterState,
} from "../projects-filtering";

export function ProjectsIndexClient({
  projects,
  locale,
  messages,
}: {
  projects: ContentEntry[];
  locale: Locale;
  messages: Messages;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<ProjectsFilterState>(() => readFilters(searchParams));
  const [query, setQuery] = useState(filters.q);

  useEffect(() => {
    const nextFilters = readFilters(searchParams);
    setFilters(nextFilters);
    setQuery(nextFilters.q);
  }, [searchParams]);
  useEffect(() => {
    const id = window.setTimeout(() => setFilters((current) => ({ ...current, q: query })), 180);
    return () => window.clearTimeout(id);
  }, [query]);
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    for (const key of ["tags", "stack", "focus"] as const) {
      const value = serializeCsv(filters[key]);
      if (value) params.set(key, value);
    }
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    startTransition(() =>
      router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false }),
    );
  }, [filters, pathname, router, startTransition]);

  const options = useMemo(() => projectFilterOptions(projects), [projects]);
  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);
  const clear = () => {
    setQuery("");
    setFilters({ q: "", tags: [], stack: [], focus: [], from: "", to: "" });
  };
  const chips = [
    ...filters.tags.map((tag) => ({
      label: tag,
      onRemove: () => setFilters({ ...filters, tags: filters.tags.filter((item) => item !== tag) }),
    })),
    ...filters.stack.map((item) => ({
      label: item,
      onRemove: () =>
        setFilters({ ...filters, stack: filters.stack.filter((value) => value !== item) }),
    })),
    ...filters.focus.map((item) => ({
      label: item,
      onRemove: () =>
        setFilters({ ...filters, focus: filters.focus.filter((value) => value !== item) }),
    })),
    ...(filters.from
      ? [
          {
            label: `${messages.filters.fromYear}: ${filters.from}`,
            onRemove: () => setFilters({ ...filters, from: "" }),
          },
        ]
      : []),
    ...(filters.to
      ? [
          {
            label: `${messages.filters.toYear}: ${filters.to}`,
            onRemove: () => setFilters({ ...filters, to: "" }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <ContentSearchInput
        value={query}
        onChange={setQuery}
        placeholder={messages.filters.searchProjects}
      />
      <div className="flex flex-wrap gap-3">
        <MultiSelectFilter
          label={messages.filters.tags}
          options={options.tags}
          selected={filters.tags}
          onChange={(tags) => setFilters({ ...filters, tags })}
        />
        <MultiSelectFilter
          label={messages.filters.stack}
          options={options.stack}
          selected={filters.stack}
          onChange={(stack) => setFilters({ ...filters, stack })}
        />
        <MultiSelectFilter
          label={messages.filters.focus}
          options={options.focus}
          selected={filters.focus}
          onChange={(focus) => setFilters({ ...filters, focus })}
        />
        <DateRangeFilter
          label={messages.filters.fromYear}
          value={filters.from}
          options={options.years}
          onChange={(from) =>
            setFilters((current) => ({
              ...current,
              from,
              to: current.to && from > current.to ? from : current.to,
            }))
          }
        />
        <DateRangeFilter
          label={messages.filters.toYear}
          value={filters.to}
          options={options.years}
          onChange={(to) =>
            setFilters((current) => ({
              ...current,
              to,
              from: current.from && current.from > to && to ? to : current.from,
            }))
          }
        />
      </div>
      <ActiveFilterChips chips={chips} onClearAll={clear} clearLabel={messages.filters.clear} />
      <p className="font-mono text-xs uppercase text-foreground/52">
        {messages.filters.showingProjects.replace("{count}", String(filtered.length))}
      </p>
      {filtered.length ? (
        <ProjectList projects={filtered} locale={locale} messages={messages} />
      ) : (
        <NoResults messages={messages} onClear={clear} />
      )}
    </div>
  );
}

function readFilters(params: URLSearchParams): ProjectsFilterState {
  return {
    q: params.get("q") ?? "",
    tags: parseCsv(params.get("tags")),
    stack: parseCsv(params.get("stack")),
    focus: parseCsv(params.get("focus")),
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
}

function NoResults({ messages, onClear }: { messages: Messages; onClear: () => void }) {
  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs uppercase text-accent">{messages.filters.noProjects}</p>
      <p className="mt-2 text-sm text-foreground/62">{messages.filters.tryFilters}</p>
      <button
        onClick={onClear}
        className="mt-4 font-mono text-xs uppercase text-accent hover:underline"
      >
        {messages.filters.clear}
      </button>
    </div>
  );
}
