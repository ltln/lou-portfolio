import type { ContentEntry } from "@/content/mdx/loader";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectRow } from "./ProjectRow";

export function ProjectList({
  projects,
  locale,
  messages,
}: {
  projects: ContentEntry[];
  locale: Locale;
  messages: Messages;
}) {
  if (!projects.length) return <EmptyState>{messages.projects.empty}</EmptyState>;
  return (
    <div>
      {projects.map((project, index) => (
        <ProjectRow
          key={project.canonicalSlug}
          project={project}
          locale={locale}
          messages={messages}
          index={index}
        />
      ))}
    </div>
  );
}
