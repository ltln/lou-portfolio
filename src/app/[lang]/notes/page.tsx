import type { Metadata } from "next";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NotesIndexClient } from "@/features/notes/components/NotesIndexClient";
import { getNotes } from "@/features/notes/notes.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const m = getMessages(locale);
  return { title: m.notes.title, description: m.notes.description };
}

export default async function NotesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const messages = getMessages(locale);
  return (
    <>
      <SectionHeader
        path={messages.notes.path}
        title={messages.notes.title}
        description={messages.notes.description}
      />
      <Suspense fallback={null}>
        <NotesIndexClient notes={getNotes(locale)} locale={locale} messages={messages} />
      </Suspense>
    </>
  );
}
