import Link from "next/link";
import type { ContentEntry } from "@/content/mdx/loader";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { titleOrFallback } from "@/features/content-title/title-safeguards";
import type { Locale } from "@/i18n/config";
import { localizedDetail } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { NoteMeta } from "./NoteMeta";

export function NoteList({
  notes,
  locale,
  messages,
}: {
  notes: ContentEntry[];
  locale: Locale;
  messages: Messages;
}) {
  if (!notes.length) return <EmptyState>{messages.notes.empty}</EmptyState>;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {notes.map((note) => {
        const title = titleOrFallback(
          note.frontmatter.title,
          "Untitled note",
          `note:${note.canonicalSlug}`,
        );
        return (
          <article
            key={note.canonicalSlug}
            data-note-card="true"
            className="group border border-border bg-surface/48 transition hover:border-accent/60 hover:bg-surface focus-within:border-accent"
          >
            {note.frontmatter.cover ? (
              <ContentCoverImage
                src={note.frontmatter.cover}
                alt={note.frontmatter.coverAlt}
                position={note.frontmatter.coverPosition}
                className="border-x-0 border-t-0 shadow-none"
              />
            ) : null}
            <div className="p-5">
              <NoteMeta note={note} messages={messages} />
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-foreground">
                <Link
                  href={localizedDetail(locale, "notes", note.canonicalSlug)}
                  className="outline-none group-hover:text-accent"
                >
                  {title}
                </Link>
              </h2>
              <div className="mt-4 border-t border-border" aria-hidden="true" />
              <p className="mt-4 text-sm leading-6 text-foreground/68">
                {note.frontmatter.description}
              </p>
              <Link
                href={localizedDetail(locale, "notes", note.canonicalSlug)}
                className="mt-5 inline-block font-mono text-xs uppercase text-accent hover:underline"
              >
                {messages.notes.read} →
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
