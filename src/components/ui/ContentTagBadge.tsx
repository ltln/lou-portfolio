import { cn } from "@/lib/utils";

export function ContentTagBadge({ tag, className }: { tag: string; className?: string }) {
  return (
    <span
      className={cn(
        "box-border inline-flex h-7 items-center whitespace-nowrap border border-border bg-surface-muted px-2 font-mono text-[0.68rem] uppercase leading-none text-foreground/64",
        className,
      )}
    >
      {tag}
    </span>
  );
}
