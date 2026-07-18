import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleProse } from "@/components/content/ArticleProse";
import { MdxFallbackNotice } from "@/components/mdx/MdxFallbackNotice";
import { SafeMdxRemote } from "@/components/mdx/SafeMdxRemote";
import { mdxOptions } from "@/components/mdx/mdxOptions";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { pageMdxComponents } from "@/features/pages/components/PageMdxComponents";
import { getPageContent } from "@/features/pages/content/page-content.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const page = getPageContent(locale, "about");
  return page ? { title: page.frontmatter.title, description: page.frontmatter.description } : {};
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const messages = getMessages(locale);
  const page = getPageContent(locale, "about");
  if (!page) notFound();
  return (
    <article>
      {page.fallback ? <MdxFallbackNotice messages={messages} /> : null}
      <ArticleProse>
        <SafeMdxRemote
          source={page.body}
          components={pageMdxComponents(locale, messages, messages.about.path.toUpperCase())}
          options={mdxOptions}
        />
      </ArticleProse>
    </article>
  );
}
