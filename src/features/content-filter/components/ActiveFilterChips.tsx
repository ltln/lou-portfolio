"use client";

export function ActiveFilterChips({
  chips,
  onClearAll,
  clearLabel,
}: {
  chips: { label: string; onRemove: () => void }[];
  onClearAll: () => void;
  clearLabel: string;
}) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onRemove}
          aria-label={chip.label}
          className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-foreground/62 hover:border-accent hover:text-accent"
        >
          {chip.label} x
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="font-mono text-[10px] uppercase text-accent hover:underline"
      >
        {clearLabel}
      </button>
    </div>
  );
}
