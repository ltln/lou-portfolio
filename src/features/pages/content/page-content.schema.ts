import { z } from "zod";
import { locales } from "@/i18n/config";

export const pageContentSchema = z.object({
  title: z.string(),
  description: z.string(),
  locale: z.enum(locales),
  translationOf: z.string(),
  published: z.boolean().default(true),
});

export type PageFrontmatter = z.infer<typeof pageContentSchema>;
