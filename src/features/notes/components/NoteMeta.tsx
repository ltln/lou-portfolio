import { formatDate } from "@/lib/utils";
import type { ContentEntry } from "@/content/mdx/loader";
import type { Messages } from "@/i18n/request";

export function NoteMeta({ note, messages }: { note: ContentEntry; messages: Messages }) {
  return (
    <p className="font-mono text-xs uppercase text-foreground/55">
      {formatDate(note.frontmatter.date)} · {note.frontmatter.tags[0] ?? messages.notes.title} ·{" "}
      {note.readingMinutes} {messages.notes.minutes}
    </p>
  );
}
