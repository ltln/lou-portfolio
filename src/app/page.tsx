import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getBestLocale } from "@/i18n/config";

export default async function RootPage() {
  const headerList = await headers();
  redirect(`/${getBestLocale(headerList.get("accept-language"))}`);
}
