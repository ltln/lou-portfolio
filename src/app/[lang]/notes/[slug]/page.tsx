import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { getNote, getNoteStaticParams } from "@/features/notes/notes.service";
import { createMdxComponents } from "@/components/mdx/MdxComponents";
import { mdxOptions } from "@/components/mdx/mdxOptions";
import { MdxFallbackNotice } from "@/components/mdx/MdxFallbackNotice";
import { SafeMdxRemote } from "@/components/mdx/SafeMdxRemote";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { getAlternateSlug } from "@/content/mdx/loader";
import { NoteMeta } from "@/features/notes/components/NoteMeta";
import { ContentCoverImage } from "@/components/content/ContentCoverImage";
import { ArticleProse } from "@/components/content/ArticleProse";
import { TagList } from "@/components/ui/TagList";

export function generateStaticParams() {
  return getNoteStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const note = getNote(locale, slug);
  return note ? { title: note.frontmatter.title, description: note.frontmatter.description } : {};
}

export default async function NoteDetail({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const messages = getMessages(locale);
  const note = getNote(locale, slug);
  if (!note) notFound();
  const localeLinks = Object.fromEntries(
    locales.map((target) => [
      target,
      `/${target}/notes/${getAlternateSlug("notes", note.canonicalSlug, target) ?? note.canonicalSlug}`,
    ]),
  ) as Record<Locale, string>;
  return (
    <article>
      {note.fallback ? <MdxFallbackNotice messages={messages} /> : null}
      <header className="border-b border-border pb-8">
        <p className="font-mono text-xs uppercase text-accent">/NOTES/{note.canonicalSlug}</p>
        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-normal text-foreground md:text-6xl">
          {note.frontmatter.title}
        </h1>
        <div className="mt-4">
          <NoteMeta note={note} messages={messages} />
        </div>
        <div className="mt-5">
          <TagList tags={note.frontmatter.tags} />
        </div>
        <div className="mt-5">
          <LocaleSwitcher locale={locale} messages={messages} links={localeLinks} />
        </div>
        <ContentCoverImage
          src={note.frontmatter.cover}
          alt={note.frontmatter.coverAlt}
          position={note.frontmatter.coverPosition}
          priority
          className="mt-7 max-w-5xl"
        />
      </header>
      <ArticleProse className="mt-10">
        <SafeMdxRemote
          source={note.body}
          components={createMdxComponents(locale)}
          options={mdxOptions}
        />
      </ArticleProse>
    </article>
  );
}
