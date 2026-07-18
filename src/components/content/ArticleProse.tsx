import { cn } from "@/lib/utils";
import { MermaidHydrator } from "@/components/mdx/MermaidHydrator";

export function ArticleProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose max-w-none break-words text-foreground/86 [overflow-wrap:anywhere] prose-p:my-5 prose-p:leading-8 prose-a:text-accent prose-a:underline prose-a:decoration-accent/50 prose-a:underline-offset-4 prose-strong:text-foreground prose-ul:pl-6 prose-ol:pl-6 prose-li:my-2 prose-li:pl-1 prose-li:marker:text-accent prose-hr:border-border prose-code:rounded-none prose-code:border prose-code:border-border prose-code:bg-surface-muted/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.88em] prose-code:font-medium prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:bg-surface-muted/50 prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-foreground/78 prose-figcaption:font-mono prose-figcaption:text-xs prose-figcaption:text-foreground/52 [&_details]:border [&_details]:border-border [&_details]:bg-surface/60 [&_details]:p-4 [&_kbd]:border [&_kbd]:border-border [&_kbd]:bg-surface-muted [&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:font-mono [&_kbd]:text-[0.82em] [&_kbd]:font-semibold [&_kbd]:text-foreground [&_kbd]:shadow-[inset_0_-1px_0_rgb(var(--foreground)/0.22)] [&_summary]:cursor-pointer [&_summary]:font-mono [&_summary]:font-semibold [&_summary]:text-foreground",
        className,
      )}
    >
      <MermaidHydrator />
      {children}
    </div>
  );
}
