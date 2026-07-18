"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";
import { ThemeMetadata } from "@/features/theme/components/ThemeMetadata";
import { MobileDrawerBackdrop } from "./MobileDrawerBackdrop";
import {
  SidebarBrand,
  SidebarElsewhere,
  SidebarNavigation,
  SidebarProfile,
} from "./SidebarContent";

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
          <SidebarBrand locale={locale} className="font-mono text-sm font-semibold" />
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-2 py-1 font-mono text-xs text-foreground/70 hover:border-accent hover:text-accent"
          >
            CLOSE
          </button>
        </div>

        <SidebarProfile messages={messages} size={96} />
        <SidebarNavigation locale={locale} messages={messages} className="mt-8" />
        <SidebarElsewhere messages={messages} className="mt-8" />

        <div className="mt-8 border-t border-border pt-5 font-mono text-[11px] uppercase text-foreground/60">
          <ThemeMetadata messages={messages} />
        </div>
      </aside>
    </div>
  );
}
