"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site.config";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { primaryNavigation } from "@/features/navigation/navigation.config";
import { ThemeMetadata } from "@/features/theme/components/ThemeMetadata";
import { MobileDrawerBackdrop } from "./MobileDrawerBackdrop";

export function MobileNavigationDrawer({
  open,
  onClose,
  locale,
  messages,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  messages: Messages;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (open) onClose();
    // Close after route navigation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={messages.nav.label}
    >
      <MobileDrawerBackdrop onClose={onClose} />
      <aside
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[min(23rem,90vw)] overflow-y-auto border-l border-border bg-surface p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_20px_70px_rgb(0_0_0_/_0.32)]"
      >
        <div className="flex items-center justify-between gap-4">
          <Link href={routeFor(locale, "home")} className="font-mono text-sm font-semibold">
            lou.moe
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-1 font-mono text-xs text-foreground/70 hover:border-accent hover:text-accent"
          >
            CLOSE
          </button>
        </div>

        <div
          className="mt-7 h-20 w-20 border border-border bg-surface-muted grid-pattern"
          aria-hidden="true"
        />
        <div className="mt-5">
          <p className="text-xl font-semibold">{messages.site.person}</p>
          <p className="mt-1 font-mono text-xs text-foreground/60">{messages.site.role}</p>
          <p className="mt-4 text-sm leading-6 text-foreground/68">{messages.site.tagline}</p>
        </div>

        <nav className="mt-8" aria-label={messages.nav.label}>
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

        <div className="mt-8">
          <p className="sidebar-label">{messages.elsewhere.label}</p>
          <div className="mt-3 grid gap-3 font-mono text-xs uppercase">
            <a href={siteConfig.links.github} className="hover:text-accent">
              {messages.elsewhere.github}
            </a>
            <a href={siteConfig.links.linkedin} className="hover:text-accent">
              {messages.elsewhere.linkedin}
            </a>
            <a href={siteConfig.links.email} className="hover:text-accent">
              {messages.elsewhere.email}
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 font-mono text-[11px] uppercase text-foreground/60">
          <ThemeMetadata messages={messages} />
        </div>
      </aside>
    </div>
  );
}
