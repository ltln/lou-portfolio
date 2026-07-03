"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { routeFor } from "@/i18n/navigation";
import type { Messages } from "@/i18n/request";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { MobileNavigationDrawer } from "./MobileNavigationDrawer";

export function MobileHeader({ locale, messages }: { locale: Locale; messages: Messages }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/94 px-4 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href={routeFor(locale, "home")} className="font-mono text-sm font-semibold">
            lou.moe
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} messages={messages} compact />
            <ThemeSelector messages={messages} placement="below" compact />
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="min-h-9 min-w-9 border border-border px-2 font-mono text-xs text-foreground/70 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              MENU
            </button>
          </div>
        </div>
      </header>
      <MobileNavigationDrawer
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
        messages={messages}
      />
    </>
  );
}
