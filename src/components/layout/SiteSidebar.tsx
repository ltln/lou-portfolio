import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/request";
import { ThemeSelector } from "@/features/theme/components/ThemeSelector";
import { ThemeMetadata } from "@/features/theme/components/ThemeMetadata";
import { LanguageSelector } from "./LanguageSelector";
import {
  SidebarBrand,
  SidebarElsewhere,
  SidebarNavigation,
  SidebarProfile,
} from "./SidebarContent";

export function SiteSidebar({ locale, messages }: { locale: Locale; messages: Messages }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-border bg-surface/64 px-7 py-8 lg:flex lg:flex-col">
      <SidebarBrand locale={locale} />
      <SidebarProfile messages={messages} />
      <SidebarNavigation locale={locale} messages={messages} />
      <SidebarElsewhere messages={messages} />
      <div className="mt-auto space-y-3 border-t border-border pt-5 font-mono text-[11px] uppercase text-foreground/60">
        <LanguageSelector locale={locale} messages={messages} />
        <ThemeSelector messages={messages} />
        <ThemeMetadata messages={messages} />
      </div>
    </aside>
  );
}
