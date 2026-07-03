"use client";

export function ContentSearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 w-full border border-border bg-background px-3 font-mono text-xs text-foreground outline-none placeholder:text-foreground/38 focus:border-accent focus:ring-2 focus:ring-accent/20"
    />
  );
}
