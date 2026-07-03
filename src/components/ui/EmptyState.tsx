export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed border-border p-6 font-mono text-xs text-foreground/60">
      {children}
    </p>
  );
}
