"use client";

import { useEffect, useRef, useState } from "react";

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
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

  function toggle(value: string) {
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="h-9 border border-border px-3 py-2 font-mono text-[11px] uppercase text-foreground/68 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {label}
        {selected.length ? `: ${selected.length}` : ""}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-2 max-h-72 w-56 overflow-auto border border-border bg-background p-2 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)]"
        >
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 px-2 py-2 font-mono text-[11px] uppercase text-foreground/70 hover:bg-surface-muted hover:text-accent"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="accent-[rgb(var(--accent))]"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
