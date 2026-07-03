import { z } from "zod";
import { locales } from "@/i18n/config";

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  coverPosition: z.string().default("center"),
  locale: z.enum(locales),
  translationOf: z.string().optional(),
  icon: z.string().optional(),
  iconAlt: z.string().optional(),
  role: z
    .preprocess(
      (value) => (Array.isArray(value) ? value.join(" · ") : value),
      z.string().optional(),
    )
    .optional(),
  stack: z.array(z.string()).default([]),
  focus: z.array(z.string()).default([]),
  links: z
    .array(
      z.object({
        label: z.string(),
        href: z.string(),
      }),
    )
    .default([]),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
