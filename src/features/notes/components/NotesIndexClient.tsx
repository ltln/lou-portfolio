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
import { NoteList } from "./NoteList";
import {
  filterNotes,
  noteMonthOptions,
  noteTagOptions,
  type NotesFilterState,
} from "../notes-filtering";

export function NotesIndexClient({
  notes,
  locale,
  messages,
}: {
  notes: ContentEntry[];
  locale: Locale;
  messages: Messages;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [filters, setFilters] = useState<NotesFilterState>(() => readFilters(searchParams));
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
    const tags = serializeCsv(filters.tags);
    if (tags) params.set("tags", tags);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    startTransition(() =>
      router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false }),
    );
  }, [filters, pathname, router, startTransition]);

  const tagOptions = useMemo(() => noteTagOptions(notes), [notes]);
  const monthOptions = useMemo(() => noteMonthOptions(notes, locale), [notes, locale]);
  const filtered = useMemo(() => filterNotes(notes, filters), [notes, filters]);
  const chips = [
    ...filters.tags.map((tag) => ({
      label: tag,
      onRemove: () => setFilters({ ...filters, tags: filters.tags.filter((item) => item !== tag) }),
    })),
    ...(filters.from
      ? [
          {
            label: `${messages.filters.fromMonth}: ${filters.from}`,
            onRemove: () => setFilters({ ...filters, from: "" }),
          },
        ]
      : []),
    ...(filters.to
      ? [
          {
            label: `${messages.filters.toMonth}: ${filters.to}`,
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
        placeholder={messages.filters.searchNotes}
      />
      <div className="flex flex-wrap gap-3">
        <MultiSelectFilter
          label={messages.filters.tags}
          options={tagOptions}
          selected={filters.tags}
          onChange={(tags) => setFilters({ ...filters, tags })}
        />
        <DateRangeFilter
          label={messages.filters.fromMonth}
          value={filters.from}
          options={monthOptions}
          onChange={(from) =>
            setFilters((current) => ({
              ...current,
              from,
              to: current.to && from > current.to ? from : current.to,
            }))
          }
        />
        <DateRangeFilter
          label={messages.filters.toMonth}
          value={filters.to}
          options={monthOptions}
          onChange={(to) =>
            setFilters((current) => ({
              ...current,
              to,
              from: current.from && current.from > to && to ? to : current.from,
            }))
          }
        />
      </div>
      <ActiveFilterChips
        chips={chips}
        clearLabel={messages.filters.clear}
        onClearAll={() => {
          setQuery("");
          setFilters({ q: "", tags: [], from: "", to: "" });
        }}
      />
      <p className="font-mono text-xs uppercase text-foreground/52">
        {messages.filters.showing.replace("{count}", String(filtered.length))}
      </p>
      {filtered.length ? (
        <NoteList notes={filtered} locale={locale} messages={messages} />
      ) : (
        <NoResults
          messages={messages}
          onClear={() => {
            setQuery("");
            setFilters({ q: "", tags: [], from: "", to: "" });
          }}
        />
      )}
    </div>
  );
}

function readFilters(params: URLSearchParams): NotesFilterState {
  return {
    q: params.get("q") ?? "",
    tags: parseCsv(params.get("tags")),
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
}

function NoResults({ messages, onClear }: { messages: Messages; onClear: () => void }) {
  return (
    <div className="border border-border p-6">
      <p className="font-mono text-xs uppercase text-accent">{messages.filters.noNotes}</p>
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
