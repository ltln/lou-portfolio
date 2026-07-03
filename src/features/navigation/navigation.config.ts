import type { RouteKey } from "@/i18n/navigation";

export interface NavigationItem {
  key: RouteKey;
  index: string;
}

export const primaryNavigation: NavigationItem[] = [
  { key: "home", index: "01" },
  { key: "projects", index: "02" },
  { key: "notes", index: "03" },
  { key: "about", index: "04" },
];
