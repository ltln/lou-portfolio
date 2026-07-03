import type { Messages } from "@/i18n/request";

export function ProfileSummary({ messages }: { messages: Messages }) {
  const items = [
    [messages.home.roleLabel, messages.site.role],
    [messages.home.focusLabel, messages.home.summaryBody],
    [messages.home.modeLabel, messages.site.theme],
  ];
  return (
    <section className="not-prose my-8 grid gap-4 border-y border-border py-6 md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="font-mono text-[10px] uppercase text-accent">{label}</p>
          <p className="mt-2 text-sm leading-6 text-foreground/70">{value}</p>
        </div>
      ))}
    </section>
  );
}
