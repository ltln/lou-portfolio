import Link from "next/link";
import { NoteList } from "@/features/notes/components/NoteList";
import { getNotes } from "@/features/notes/notes.service";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";

export function RecentNotes({
  locale,
  messages,
  limit = 3,
}: {
  locale: Locale;
  messages: Messages;
  limit?: number;
}) {
  const notes = getNotes(locale).slice(0, safeLimit(limit));
  return (
    <section className="not-prose my-12">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase text-accent">/NOTES/RECENT</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {messages.home.recentNotes}
          </h2>
        </div>
        <Link href={routeFor(locale, "notes")} className="link-mono shrink-0">
          {messages.home.allNotes} →
        </Link>
      </div>
      <NoteList notes={notes} locale={locale} messages={messages} />
    </section>
  );
}

function safeLimit(value: number) {
  return Math.min(12, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 3));
}
