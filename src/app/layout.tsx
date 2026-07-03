import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/features/theme/theme.provider";
import { ThemeDecoration } from "@/features/theme/decorations/ThemeDecoration";
import { ThemeScript } from "@/features/theme/components/ThemeScript";
import { ThemeStyles } from "@/features/theme/components/ThemeStyles";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "lou.moe", template: "%s - lou.moe" },
  description: "Personal engineering portfolio for cloud, DevSecOps, and full-stack work.",
  openGraph: { siteName: "lou.moe", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeStyles />
        <ThemeScript />
        <ThemeProvider>
          <ThemeDecoration />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
