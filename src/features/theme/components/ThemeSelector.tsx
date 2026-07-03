"use client";

import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/i18n/request";
import { labelForTheme } from "../theme.utils";
import { useThemeMode } from "../theme.provider";
import { ThemeMenu } from "./ThemeMenu";

export function ThemeSelector({
  messages,
  placement = "above",
  compact = false,
}: {
  messages: Messages;
  placement?: "above" | "below";
  compact?: boolean;
}) {
  const { selection, setSelection, availableThemes } = useThemeMode();
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

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="min-h-9 border border-border px-2 py-1 font-mono text-[11px] uppercase text-foreground/68 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {compact ? (
          <span className="text-accent">Theme</span>
        ) : (
          <>
            {messages.themeToggle.label}:{" "}
            <span className="text-accent">{labelForTheme(selection)}</span>
          </>
        )}
      </button>
      {open ? (
        <div role="menu" aria-label={messages.themeToggle.label}>
          <ThemeMenu
            messages={messages}
            active={selection}
            placement={placement}
            customThemes={availableThemes}
            onSelect={(nextSelection) => {
              setSelection(nextSelection);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
