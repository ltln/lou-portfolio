import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArticleProse } from "@/components/content/ArticleProse";
import { MdxFallbackNotice } from "@/components/mdx/MdxFallbackNotice";
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
  const page = getPageContent(locale, "home");
  return page ? { title: page.frontmatter.title, description: page.frontmatter.description } : {};
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const messages = getMessages(locale);
  const page = getPageContent(locale, "home");
  if (!page) notFound();
  return (
    <article>
      {page.fallback ? <MdxFallbackNotice messages={messages} /> : null}
      <ArticleProse>
        <MDXRemote
          source={page.body}
          components={pageMdxComponents(locale, messages, messages.home.path.toUpperCase())}
        />
      </ArticleProse>
    </article>
  );
}
