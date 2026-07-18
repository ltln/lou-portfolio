import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { primaryNavigation } from "@/features/navigation/navigation.config";

export function SidebarBrand({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <Link
      href={routeFor(locale, "home")}
      className={className ?? "font-mono text-sm font-semibold tracking-normal text-foreground"}
    >
      lou.moe
    </Link>
  );
}

export function SidebarProfile({ messages, size = 160 }: { messages: Messages; size?: number }) {
  return (
    <>
      <Image
        src={siteConfig.avatarUrl}
        alt={siteConfig.avatarAlt}
        width={size}
        height={size}
        className="mt-5 rounded-full"
      />
      <div className="mt-6">
        <p className="text-xl font-semibold">{messages.site.person}</p>
        <p className="mt-1 font-mono text-xs text-foreground/60">{messages.site.role}</p>
        <p className="mt-4 text-sm leading-6 text-foreground/68">{messages.site.tagline}</p>
      </div>
    </>
  );
}

export function SidebarNavigation({
  locale,
  messages,
  className = "mt-9",
}: {
  locale: Locale;
  messages: Messages;
  className?: string;
}) {
  return (
    <nav className={className} aria-label={messages.nav.label}>
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
  );
}

export function SidebarElsewhere({
  messages,
  className = "mt-9",
}: {
  messages: Messages;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="sidebar-label">{messages.elsewhere.label}</p>
      <div className="mt-3 grid gap-2 font-mono text-xs uppercase">
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
  );
}
