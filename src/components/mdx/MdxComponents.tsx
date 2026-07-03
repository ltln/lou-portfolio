import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/content/Figure";
import { TableWrapper } from "@/components/content/TableWrapper";
import { WideContent } from "@/components/content/WideContent";

function slugFrom(children: React.ReactNode) {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export const mdxComponents: MDXComponents = {
  Figure,
  WideContent,
  h2: ({ children }) => {
    const id = slugFrom(children);
    return (
      <h2
        id={id}
        className="group relative mt-12 border-t border-border pt-5 font-sans text-2xl font-semibold leading-tight tracking-normal text-foreground md:text-3xl"
      >
        <a
          className="absolute -left-5 font-mono text-xs text-accent no-underline opacity-0 transition hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
          href={`#${id}`}
          aria-label={`Link to ${children}`}
        >
          #
        </a>
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = slugFrom(children);
    return (
      <h3
        id={id}
        className="group relative mt-9 font-sans text-xl font-semibold leading-snug tracking-normal text-foreground"
      >
        <a
          className="absolute -left-5 font-mono text-xs text-accent no-underline opacity-0 transition hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
          href={`#${id}`}
          aria-label={`Link to ${children}`}
        >
          #
        </a>
        {children}
      </h3>
    );
  },
  h4: ({ children }) => (
    <h4 className="mt-8 font-mono text-sm font-semibold leading-snug tracking-normal text-foreground">
      {children}
    </h4>
  ),
  a: ({ href = "", children }) => (
    <a href={href} className="underline decoration-accent/50 underline-offset-4 hover:text-accent">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent bg-surface-muted/50 px-5 py-4 text-foreground/78 not-italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => <TableWrapper>{children}</TableWrapper>,
  pre: ({ children }) => (
    <WideContent className="my-8">
      <pre className="overflow-x-auto border border-border bg-surface p-4 font-mono text-sm leading-7 text-foreground">
        {children}
      </pre>
    </WideContent>
  ),
};
