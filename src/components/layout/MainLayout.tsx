import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/request";
import { SiteSidebar } from "./SiteSidebar";
import { MobileHeader } from "./MobileHeader";

export function MainLayout({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const messages = getMessages(locale);
  return (
    <div className="min-h-screen lg:flex">
      <SiteSidebar locale={locale} messages={messages} />
      <div className="min-w-0 flex-1">
        <MobileHeader locale={locale} messages={messages} />
        <main className="content-shell py-10 md:py-14">{children}</main>
        <footer className="content-shell pb-10 font-mono text-[11px] uppercase text-foreground/45">
          {messages.site.footer}
        </footer>
      </div>
    </div>
  );
}
