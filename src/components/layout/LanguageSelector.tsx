"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locales, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";

const labels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export function LanguageSelector({
  locale,
  messages,
  compact = false,
}: {
  locale: Locale;
  messages: Messages;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function hrefFor(nextLocale: Locale) {
    const parts = pathname.split("/");
    if (parts[1]) parts[1] = nextLocale;
    return parts.join("/") || `/${nextLocale}`;
  }

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={messages.meta.localeSwitch}
        onClick={() => setOpen((value) => !value)}
        className="min-h-9 border border-border px-2 py-1 font-mono text-[11px] uppercase text-foreground/68 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {compact ? (
          <span className="text-accent">{locale.toUpperCase()}</span>
        ) : (
          <>
            Lang: <span className="text-accent">{locale.toUpperCase()}</span>
          </>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={messages.meta.localeSwitch}
          className={
            compact
              ? "absolute right-0 top-full z-20 mt-2 w-44 border border-border bg-background p-1 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)]"
              : "absolute bottom-full left-0 z-20 mb-2 w-44 border border-border bg-background p-1 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)]"
          }
        >
          {locales.map((item) => (
            <Link
              key={item}
              href={hrefFor(item)}
              aria-current={item === locale ? "true" : undefined}
              onClick={() => setOpen(false)}
              className="block border border-transparent px-3 py-2 font-mono text-[11px] uppercase text-foreground/68 hover:border-border hover:bg-surface-muted hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent data-[active=true]:text-accent"
              data-active={item === locale}
              role="menuitem"
            >
              {labels[item]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
