import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/content/Figure";
import { TableWrapper } from "@/components/content/TableWrapper";
import { WideContent } from "@/components/content/WideContent";
import type { Locale } from "@/i18n/config";

function slugFrom(children: React.ReactNode) {
  return String(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function safeHref(href: string) {
  const trimmed = href.trim();
  return /^(https?:|mailto:|tel:|#|\/)/i.test(trimmed) ? trimmed : "#";
}

function localizedHref(href: string, locale?: Locale) {
  const safe = safeHref(href);
  if (!locale || safe === "#" || safe.startsWith("#")) return safe;
  if (/^(https?:|mailto:|tel:)/i.test(safe)) return safe;
  if (safe === "/") return `/${locale}`;
  if (safe === `/${locale}` || safe.startsWith(`/${locale}/`)) return safe;
  return `/${locale}${safe}`;
}

function HeadingAnchor({
  id,
  label,
  className,
}: {
  id: string;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={`ml-2 inline-flex h-6 w-6 items-center justify-center align-middle leading-none border border-border bg-surface font-mono text-xs text-accent no-underline opacity-0 transition hover:text-accent/65 hover:opacity-100 focus-visible:opacity-100 group-hover/heading:opacity-70 md:absolute md:ml-0 md:-translate-x-full ${className ?? ""}`}
      href={`#${id}`}
      aria-label={`Link to ${label}`}
    >
      #
    </a>
  );
}

export function createMdxComponents(locale?: Locale): MDXComponents {
  return {
    Figure,
    WideContent,
    TestComponent: ({ children, ...props }) => (
      <div className="not-prose my-5 border border-border bg-surface/70 p-4 text-sm text-foreground/80">
        <p className="font-mono text-xs uppercase text-accent">Test component</p>
        {Object.keys(props).length ? (
          <pre className="mt-3 overflow-x-auto border border-border bg-surface-muted p-3 font-mono text-xs leading-5 text-foreground/72">
            {JSON.stringify(props, null, 2)}
          </pre>
        ) : null}
        {children ? (
          <div className="prose prose-sm mt-3 max-w-none text-foreground/82">{children}</div>
        ) : null}
      </div>
    ),
    Callout: ({
      children,
      type = "info",
      title,
    }: {
      children?: React.ReactNode;
      type?: string;
      title?: string;
    }) => (
      <aside className="my-5 border-l-2 border-accent bg-surface-muted/55 px-5 py-4 text-foreground/80">
        <p className="m-0 font-mono text-xs uppercase text-accent">{title ?? type}</p>
        <div className="mt-2">{children}</div>
      </aside>
    ),
    CodePreview: ({
      children,
      language,
      title,
    }: {
      children?: React.ReactNode;
      language?: string;
      title?: string;
    }) => (
      <WideContent className="my-8 border border-border bg-surface">
        <div className="border-b border-border px-4 py-2 font-mono text-xs uppercase text-foreground/58">
          {title ?? language ?? "Code preview"}
        </div>
        <pre className="m-0 overflow-x-auto p-4 font-mono text-sm leading-7 text-foreground">
          <code>{children}</code>
        </pre>
      </WideContent>
    ),
    h1: ({ children }) => {
      const id = slugFrom(children);
      return (
        <h1
          id={id}
          className="group/heading relative mt-12 font-sans text-3xl font-semibold leading-tight tracking-normal text-foreground md:text-4xl"
        >
          {children}
          <HeadingAnchor
            id={id}
            label={children}
            className="-translate-y-0.5 md:-left-[10px] md:top-6 md:-translate-y-1/2"
          />
        </h1>
      );
    },
    h2: ({ children }) => {
      const id = slugFrom(children);
      return (
        <h2
          id={id}
          className="group/heading relative mt-12 border-t border-border pt-5 font-sans text-2xl font-semibold leading-tight tracking-normal text-foreground md:text-3xl"
        >
          {children}
          <HeadingAnchor
            id={id}
            label={children}
            className="-translate-y-0.5 md:-left-[10px] md:top-10 md:-translate-y-1/2"
          />
        </h2>
      );
    },
    h3: ({ children }) => {
      const id = slugFrom(children);
      return (
        <h3
          id={id}
          className="group/heading relative mt-9 font-sans text-xl font-semibold leading-snug tracking-normal text-foreground"
        >
          {children}
          <HeadingAnchor
            id={id}
            label={children}
            className="-translate-y-0.5 md:-left-[10px] md:top-5 md:-translate-y-1/2"
          />
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="mt-8 font-mono text-sm font-semibold leading-snug tracking-normal text-foreground">
        {children}
      </h4>
    ),
    a: ({ href = "", title, children }) => {
      const external = /^https?:/i.test(href);
      return (
        <a
          href={localizedHref(href, locale)}
          title={title}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className="underline decoration-accent/50 underline-offset-4 transition hover:text-accent/65 hover:decoration-accent/35"
        >
          {children}
        </a>
      );
    },
    kbd: ({ children }) => (
      <kbd className="rounded-none border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[0.82em] font-semibold text-foreground shadow-[inset_0_-1px_0_rgb(var(--foreground)/0.22)]">
        {children}
      </kbd>
    ),
    details: ({ children }) => (
      <details className="my-6 border border-border bg-surface/60 p-4 text-foreground/82">
        {children}
      </details>
    ),
    summary: ({ children }) => (
      <summary className="cursor-pointer font-mono text-sm font-semibold text-foreground">
        {children}
      </summary>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent bg-surface-muted/50 px-5 py-4 text-foreground/78 not-italic">
        {children}
      </blockquote>
    ),
    table: ({ children }) => <TableWrapper>{children}</TableWrapper>,
    pre: ({ children }) => (
      <WideContent className="my-8">
        <pre className="overflow-x-auto border border-border bg-surface p-4 font-mono text-sm leading-7 text-foreground [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
          {children}
        </pre>
      </WideContent>
    ),
  };
}

export const mdxComponents: MDXComponents = createMdxComponents();
