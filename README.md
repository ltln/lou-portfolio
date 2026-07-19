# lou.moe

Personal engineering portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Bun, locale-based routing, MDX content, and a configurable theme layer.

## Commands

```bash
bun install
bun run dev
bun run lint
bun run typecheck
bun run build
bun run start
```

## Structure

```text
content/
  notes/
  projects/
src/
  app/[lang]/
  components/
  config/
  content/
  features/
  i18n/
  lib/
  styles/
```

## Localization

Supported locales live in `src/i18n/config.ts`. Interface strings live in `src/i18n/messages/en.json` and `src/i18n/messages/vi.json`. `/` redirects from the `Accept-Language` header, preferring `/vi` for Vietnamese and `/en` otherwise.

## MDX authoring

Add notes to `content/notes` and projects to `content/projects`.

Required filename format:

```text
YYYY-MM-DD_slug.lang.mdx
```

Example:

```text
2026-06-29_designing-small-systems.en.mdx
2026-06-29_designing-small-systems.vi.mdx
```

Frontmatter is validated in `src/content/schemas/frontmatter.ts`. Use `translationOf` to group translated entries. English is the fallback when a localized MDX file is missing.

## Themes

Base and custom theme config lives in `src/features/theme/theme.config.ts`.

```ts
export const activeTheme = {
  baseTheme: "system",
  customTheme: "none",
};
```

Set theme selection to an enabled custom theme such as `dotmoe`, `monsoon`, `lunar-new-year`, `winter`, `terminal-green`, or `midnight-blueprint` to enable a site-owner controlled overlay. Visual tokens live in `src/styles/globals.css`.

## Ambient effects

tsParticles decoration is implemented in `src/features/theme/decorations/ThemeDecoration.tsx` and configured in `src/features/theme/theme.config.ts`. Effects are disabled by default with `decorationsEnabled = false`, respect reduced motion, and are skipped on mobile.

## Architecture notes

The app uses feature folders for home, notes, projects, and theme. MDX parsing is file-based and server-side. UI strings are read from message files rather than hardcoded in pages. Layout, typography, and content components are shared across theme modes; themes only change CSS tokens and optional decoration.
