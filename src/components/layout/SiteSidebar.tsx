import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { primaryNavigation } from "@/features/navigation/navigation.config";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { ThemeMetadata } from "@/features/theme/components/ThemeMetadata";
import { LanguageSelector } from "./LanguageSelector";

export function SiteSidebar({ locale, messages }: { locale: Locale; messages: Messages }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-border bg-surface/64 px-7 py-8 lg:flex lg:flex-col">
      <Link
        href={routeFor(locale, "home")}
        className="font-mono text-sm font-semibold tracking-normal text-foreground"
      >
        lou.moe
      </Link>
      <div
        className="mt-8 h-24 w-24 border border-border bg-surface-muted grid-pattern"
        aria-hidden="true"
      />
      <div className="mt-6">
        <p className="text-xl font-semibold">{messages.site.person}</p>
        <p className="mt-1 font-mono text-xs text-foreground/60">{messages.site.role}</p>
        <p className="mt-4 text-sm leading-6 text-foreground/68">{messages.site.tagline}</p>
      </div>
      <nav className="mt-9" aria-label={messages.nav.label}>
        <p className="sidebar-label">{messages.nav.label}</p>
        <div className="mt-3 space-y-1">
          {primaryNavigation.map((item) => (
            <Link key={item.key} href={routeFor(locale, item.key)} className="sidebar-link">
              <span>[{item.index}]</span>
              <span>{messages.nav[item.key]}</span>
            </Link>
          ))}
        </div>
      </nav>
      <div className="mt-9">
        <p className="sidebar-label">{messages.elsewhere.label}</p>
        <div className="mt-3 grid gap-2 font-mono text-xs">
          <Link
            href={siteConfig.links.github}
            className="hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.elsewhere.github}
          </Link>
          <Link
            href={siteConfig.links.linkedin}
            className="hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.elsewhere.linkedin}
          </Link>
          <Link
            href={siteConfig.links.email}
            className="hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            {messages.elsewhere.email}
          </Link>
        </div>
      </div>
      <div className="mt-auto space-y-3 border-t border-border pt-5 font-mono text-[11px] uppercase text-foreground/60">
        <LanguageSelector locale={locale} messages={messages} />
        <ThemeSelector messages={messages} />
        <ThemeMetadata messages={messages} />
      </div>
    </aside>
  );
}
