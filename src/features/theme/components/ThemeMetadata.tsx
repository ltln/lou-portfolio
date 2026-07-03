"use client";

import type { Messages } from "@/i18n/request";
import { useThemeMode } from "../theme.provider";
import { labelForTheme, metadataForTheme } from "../theme.utils";

export function ThemeMetadata({ messages }: { messages: Messages }) {
  const { selection } = useThemeMode();
  const metadata = metadataForTheme(selection);

  return (
    <div className="space-y-1">
      <p>
        Status:{" "}
        <span className="text-accent">{metadata?.sidebarStatus ?? messages.site.status}</span>
      </p>
      <p>Theme: {metadata?.sidebarThemeLabel ?? labelForTheme(selection)}</p>
      {metadata?.seasonLabel ? <p>Season: {metadata.seasonLabel}</p> : null}
    </div>
  );
}
