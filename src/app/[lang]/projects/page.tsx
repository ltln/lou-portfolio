import type { Metadata } from "next";
import { Suspense } from "react";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectsIndexClient } from "@/features/projects/components/ProjectsIndexClient";
import { getProjects } from "@/features/projects/projects.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const m = getMessages(locale);
  return { title: m.projects.title, description: m.projects.description };
}

export default async function ProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = (isLocale(lang) ? lang : "en") as Locale;
  const messages = getMessages(locale);
  return (
    <>
      <SectionHeader
        path={messages.projects.path}
        title={messages.projects.title}
        description={messages.projects.description}
      />
      <Suspense fallback={null}>
        <ProjectsIndexClient projects={getProjects(locale)} locale={locale} messages={messages} />
      </Suspense>
    </>
  );
}
