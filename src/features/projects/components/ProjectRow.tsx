import Link from "next/link";
import type { ContentEntry } from "@/content/mdx/loader";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";
import { localizedDetail } from "@/i18n/navigation";
import { TagList } from "@/components/ui/TagList";
import { ProjectIcon } from "@/components/content/ProjectIcon";

export function ProjectRow({
  project,
  locale,
  messages,
  index,
}: {
  project: ContentEntry;
  locale: Locale;
  messages: Messages;
  index: number;
}) {
  return (
    <article className="border-b border-border py-7 first:border-t">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_80px]">
        <div className="min-w-0">
          <p className="font-mono text-xs text-accent">
            [PROJECT_{String(index + 1).padStart(2, "0")}]
          </p>
          <h2 className="mt-3 text-2xl font-semibold">{project.frontmatter.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/68">
            {project.frontmatter.description}
          </p>
          <Link
            href={localizedDetail(locale, "projects", project.canonicalSlug)}
            className="mt-5 inline-block font-mono text-xs uppercase text-accent hover:underline"
          >
            {messages.projects.read} →
          </Link>
        </div>
        <div className="sm:justify-self-end">
          <ProjectIcon src={project.frontmatter.icon} alt={project.frontmatter.iconAlt} />
        </div>
        <dl className="grid gap-4 font-mono text-xs sm:col-span-2 md:grid-cols-3">
          {project.frontmatter.role ? (
            <Meta label={messages.projects.role} value={project.frontmatter.role} />
          ) : null}
          <Meta label={messages.projects.stack} value={project.frontmatter.stack.join(" · ")} />
          <Meta label={messages.projects.focus} value={project.frontmatter.focus.join(" · ")} />
        </dl>
        <div className="sm:col-span-2">
          <TagList tags={project.frontmatter.tags} />
        </div>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-foreground/42">{label}</dt>
      <dd className="mt-1 text-foreground/72">{value}</dd>
    </div>
  );
}
