import Link from "next/link";
import type { ContentEntry } from "@/content/mdx/loader";
import { ProjectIcon } from "@/components/content/ProjectIcon";
import { TagList } from "@/components/ui/TagList";
import { titleOrFallback } from "@/features/content-title/title-safeguards";
import type { Locale } from "@/i18n/config";
import { localizedDetail } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { cn } from "@/lib/utils";

export function SelectedProjectCard({
  project,
  locale,
  messages,
  index,
  variant = "default",
}: {
  project: ContentEntry;
  locale: Locale;
  messages: Messages;
  index: number;
  variant?: "featured" | "default";
}) {
  const featured = variant === "featured";
  const title = titleOrFallback(
    project.frontmatter.title,
    "Untitled project",
    `project:${project.canonicalSlug}`,
  );
  return (
    <article
      data-selected-project-card="true"
      data-variant={variant}
      className={cn(
        "group border p-5 transition focus-within:border-accent hover:border-accent/60 md:p-6 border-border bg-surface/48 border-accent/55 hover:bg-surface hover:shadow-[inset_3px_0_0_rgb(var(--accent)/0.72),0_14px_48px_rgb(var(--accent)/0.08)]",
      )}
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_80px]">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase text-accent">
            [{featured ? "FEATURED / " : ""}PROJECT_{String(index + 1).padStart(2, "0")}]
          </p>
          <h3
            className={cn(
              "mt-3 text-2xl leading-tight text-foreground group-hover:text-accent",
              featured ? "font-bold" : "font-semibold",
            )}
          >
            <Link
              href={localizedDetail(locale, "projects", project.canonicalSlug)}
              className="outline-none"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/68">
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
