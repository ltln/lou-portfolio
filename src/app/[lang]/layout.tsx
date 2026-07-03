import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { MainLayout } from "@/components/layout/MainLayout";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <MainLayout locale={lang as Locale}>{children}</MainLayout>;
}
