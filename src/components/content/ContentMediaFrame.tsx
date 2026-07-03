import { cn } from "@/lib/utils";

export function ContentMediaFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden border border-border bg-surface-muted/60 shadow-[0_12px_36px_rgb(0_0_0_/_0.08)]",
        className,
      )}
    >
      {children}
    </figure>
  );
}
