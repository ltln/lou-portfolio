import type { Messages } from "@/i18n/request";

export function MdxFallbackNotice({ messages }: { messages: Messages }) {
  return (
    <p className="mb-6 border border-accent/40 bg-accent-muted/35 p-3 font-mono text-xs text-foreground/70">
      {messages.meta.fallback}
    </p>
  );
}
