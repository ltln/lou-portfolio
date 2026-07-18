import type { MDXComponents } from "mdx/types";
import { WideContent } from "@/components/content/WideContent";
import { createMdxComponents } from "@/components/mdx/MdxComponents";
import { SelectedProjects } from "@/features/projects/components/SelectedProjects";
import { RecentNotes } from "@/features/home/components/RecentNotes";
import { ProfileSummary } from "@/features/home/components/ProfileSummary";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";

export function pageMdxComponents(
  locale: Locale,
  messages: Messages,
  routeLabel: string,
): MDXComponents {
  return {
    ...createMdxComponents(locale),
    h1: ({ children }) => (
      <header className="mb-8 border-b border-border pb-8">
        <p className="font-mono text-xs uppercase text-accent">{routeLabel}</p>
        <h1 className="mt-4 max-w-5xl text-balance text-4xl font-semibold leading-[1.08] tracking-normal text-foreground md:text-6xl">
          {children}
        </h1>
      </header>
    ),
    SelectedProjects: ({ limit }: { limit?: number }) => (
      <WideContent>
        <SelectedProjects locale={locale} messages={messages} limit={limit} />
      </WideContent>
    ),
    RecentNotes: ({ limit }: { limit?: number }) => (
      <WideContent>
        <RecentNotes locale={locale} messages={messages} limit={limit} />
      </WideContent>
    ),
    ProfileSummary: () => <ProfileSummary messages={messages} />,
    Callout: ({ children }: { children?: React.ReactNode }) => (
      <aside className="not-prose my-6 border-l-2 border-accent bg-surface-muted/50 p-4 text-sm leading-6 text-foreground/74">
        {children}
      </aside>
    ),
  };
}
