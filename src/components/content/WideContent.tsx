import { cn } from "@/lib/utils";

export function WideContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("not-prose w-full max-w-full", className)}>{children}</div>;
}
