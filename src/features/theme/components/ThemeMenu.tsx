"use client";

import type { Messages } from "@/i18n/request";
import { baseThemeSelections } from "../theme.storage";
import type { CustomThemeDefinition, UserThemeSelection } from "../theme.types";

export function ThemeMenu({
  messages,
  active,
  onSelect,
  placement = "above",
  customThemes,
}: {
  messages: Messages;
  active: UserThemeSelection;
  onSelect: (selection: UserThemeSelection) => void;
  placement?: "above" | "below";
  customThemes: CustomThemeDefinition[];
}) {
  return (
    <div
      className={
        placement === "above"
          ? "absolute bottom-full left-0 z-20 mb-2 w-56 border border-border bg-background p-2 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)]"
          : "absolute right-0 top-full z-20 mt-2 w-56 border border-border bg-background p-2 shadow-[0_18px_60px_rgb(0_0_0_/_0.18)]"
      }
    >
      <ThemeGroup label={messages.themeToggle.appearance}>
        {baseThemeSelections.map((selection) => (
          <ThemeOption
            key={selection}
            active={active === selection}
            label={messages.themeToggle[selection]}
            onSelect={() => onSelect(selection)}
          />
        ))}
      </ThemeGroup>
      {customThemes.length ? (
        <ThemeGroup label={messages.themeToggle.themes}>
          {customThemes.map((theme) => (
            <ThemeOption
              key={theme.id}
              active={active === theme.id}
              label={theme.label}
              description={theme.description}
              onSelect={() => onSelect(theme.id)}
            />
          ))}
        </ThemeGroup>
      ) : null}
    </div>
  );
}

function ThemeGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-2 pb-1 font-mono text-[10px] uppercase text-foreground/42">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ThemeOption({
  active,
  label,
  description,
  onSelect,
}: {
  active: boolean;
  label: string;
  description?: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onSelect}
      className="grid w-full grid-cols-[16px_1fr] gap-2 border border-transparent px-2 py-2 text-left hover:border-border hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="font-mono text-xs text-accent" aria-hidden="true">
        {active ? "●" : "○"}
      </span>
      <span>
        <span className="block font-mono text-[11px] uppercase text-foreground/78">{label}</span>
        {description ? (
          <span className="mt-1 block text-xs leading-4 text-foreground/52">{description}</span>
        ) : null}
      </span>
    </button>
  );
}
