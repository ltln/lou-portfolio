export function SectionHeader({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8 border-b border-border pb-5">
      <p className="font-mono text-xs uppercase tracking-normal text-accent">{path}</p>
      <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/68">{description}</p>
      ) : null}
    </header>
  );
}
