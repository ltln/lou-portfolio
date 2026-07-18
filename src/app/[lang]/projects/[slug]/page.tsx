import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { getProject, getProjectStaticParams } from "@/features/projects/projects.service";
import { createMdxComponents } from "@/components/mdx/MdxComponents";
import { mdxOptions } from "@/components/mdx/mdxOptions";
import { MdxFallbackNotice } from "@/components/mdx/MdxFallbackNotice";
import { SafeMdxRemote } from "@/components/mdx/SafeMdxRemote";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { getAlternateSlug } from "@/content/mdx/loader";
import { TagList } from "@/components/ui/TagList";
import { ProjectIcon } from "@/components/content/ProjectIcon";
import { ArticleProse } from "@/components/content/ArticleProse";

export function generateStaticParams() {
  return getProjectStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const project = getProject(locale, slug);
  return project
    ? { title: project.frontmatter.title, description: project.frontmatter.description }
    : {};
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const messages = getMessages(locale);
  const project = getProject(locale, slug);
  if (!project) notFound();
  const localeLinks = Object.fromEntries(
    locales.map((target) => [
      target,
      `/${target}/projects/${getAlternateSlug("projects", project.canonicalSlug, target) ?? project.canonicalSlug}`,
    ]),
  ) as Record<Locale, string>;

  return (
    <article>
      {project.fallback ? <MdxFallbackNotice messages={messages} /> : null}
      <header className="border-b border-border pb-8">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_88px]">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase text-accent">
              /PROJECTS/{project.canonicalSlug}
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              {project.frontmatter.title}
            </h1>
          </div>
          <div className="sm:justify-self-end">
            <ProjectIcon src={project.frontmatter.icon} alt={project.frontmatter.iconAlt} />
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-foreground/68">{project.frontmatter.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <LocaleSwitcher locale={locale} messages={messages} links={localeLinks} />
          <TagList tags={project.frontmatter.tags} />
        </div>
      </header>
      <dl className="grid gap-5 border-b border-border py-7 font-mono text-xs md:grid-cols-3">
        {project.frontmatter.role ? (
          <ProjectMeta label={messages.projects.role} value={project.frontmatter.role} />
        ) : null}
        <ProjectMeta
          label={messages.projects.stack}
          value={project.frontmatter.stack.join(" · ")}
        />
        <ProjectMeta
          label={messages.projects.focus}
          value={project.frontmatter.focus.join(" · ")}
        />
      </dl>
      <ArticleProse className="mt-10">
        <SafeMdxRemote
          source={project.body}
          components={createMdxComponents(locale)}
          options={mdxOptions}
        />
      </ArticleProse>
    </article>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-foreground/42">{label}</dt>
      <dd className="mt-2 text-foreground/74">{value}</dd>
    </div>
  );
}
