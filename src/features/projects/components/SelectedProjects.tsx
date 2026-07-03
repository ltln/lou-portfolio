import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { getFeaturedProjects } from "../projects.service";
import { SelectedProjectCard } from "./SelectedProjectCard";

export function SelectedProjects({
  locale,
  messages,
  limit = 3,
}: {
  locale: Locale;
  messages: Messages;
  limit?: number;
}) {
  const projects = getFeaturedProjects(locale).slice(0, safeLimit(limit));
  return (
    <section className="my-12">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase text-accent">/FEATURED/CASE-FILES</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {messages.home.selectedProjects}
          </h2>
        </div>
        <Link href={routeFor(locale, "projects")} className="link-mono shrink-0">
          {messages.home.allProjects} →
        </Link>
      </div>
      {projects.length ? (
        <div className="space-y-5">
          {projects.map((project, index) => (
            <SelectedProjectCard
              key={project.canonicalSlug}
              project={project}
              locale={locale}
              messages={messages}
              index={index}
              variant={index === 0 ? "featured" : "default"}
            />
          ))}
        </div>
      ) : (
        <EmptyState>{messages.projects.empty}</EmptyState>
      )}
    </section>
  );
}

function safeLimit(value: number) {
  return Math.min(12, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 3));
}
