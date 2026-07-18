# AGENTS.md

## Project Overview

- Personal portfolio for `lou.moe`, built with Next.js App Router, React 19, TypeScript, Tailwind CSS, Bun, locale-based routing, and MDX content.
- Main app routes live under `src/app`; localized pages use `src/app/[lang]` with supported locales from `src/i18n/config.ts` (`en`, `vi`, fallback `en`).
- Content is file-based MDX in `content/`; loaders and normalization live in `src/content/mdx/loader.ts` and `src/features/pages/content/page-content.service.ts`.
- Themes are token-driven. Definitions and availability rules live in `src/features/theme/theme.config.ts`, `theme.types.ts`, and `theme.availability.ts`.
- Public SVG and media assets belong under `public/`; generated hero SVGs currently live in `public/hero/` and are served by `src/app/api/hero/route.ts`.

## Repository Structure

- `src/app/`: Next.js routes, layouts, `not-found`, and API routes. Use `src/app/api/<name>/route.ts` for route handlers.
- `src/components/`: shared UI, layout, content, and MDX components. Reuse existing components such as `ArticleProse`, `SafeMdxRemote`, `Figure`, `WideContent`, and layout navigation pieces.
- `src/features/`: feature modules for home, notes, projects, theme, content filters, and pages. Keep feature-specific services/types/components here.
- `src/content/`: content schemas and MDX loader utilities.
- `src/i18n/`: locale config, navigation, and messages (`src/i18n/messages/en.json`, `vi.json`). Put UI strings in message files rather than hardcoding in pages.
- `content/notes` and `content/projects`: published MDX entries named `YYYY-MM-DD_slug.locale.mdx`.
- `content/pages`: localized home/about MDX files: `home.en.mdx`, `home.vi.mdx`, `about.en.mdx`, `about.vi.mdx`.
- `docs/`: authoring and theme documentation. Update when behavior or authoring rules change.
- `scripts/`: Bun/TypeScript maintenance scripts: precommit, commitlint, content checker.
- `tests/`: Bun tests. Current test file: `tests/home-content.test.tsx`.

## Development Workflow

- Install dependencies: `bun install`.
- Start dev server: `bun run dev`.
- Production build: `bun run build`.
- Start built app: `bun run start`.
- Lint: `bun run lint` (`eslint . --max-warnings=0`).
- Type-check: `bun run typecheck` (`tsc --noEmit -p tsconfig.typecheck.json`).
- Tests: `bun test` or `bun run test`.
- Format check: `bun run format`; format write: `bun run format:fix`.
- Content validation for staged content: `bun run content:check`.
- Content validation for all content: `bun run content:check:all`.
- Full precommit sequence: `bun run precommit` runs content check, format, lint, typecheck, then tests.
- Narrow checks:
  - One test file: `bun test tests/home-content.test.tsx`.
  - One formatted file: `bunx prettier --check path/to/file` or `bunx prettier --write path/to/file`.
  - Content checker script directly: `bun scripts/validate-content.ts --all`.

## Coding Conventions

- TypeScript is used throughout `src/` and `scripts/`; TS path alias `@/` points to `src/`.
- Follow existing feature-folder boundaries. Add shared UI to `src/components`, feature code to `src/features/<feature>`, and route composition to `src/app`.
- Use Tailwind utility classes and theme tokens (`background`, `foreground`, `surface`, `border`, `accent`) instead of hardcoded app CSS when possible.
- Keep custom theme additions consistent with `CustomThemeDefinition` in `src/features/theme/theme.types.ts`; update `docs/theme-customization.md` for theme behavior changes.
- Use server-side content services (`getNotes`, `getProjects`, `getPageContent`) rather than reading MDX directly in route components.
- MDX render failures should use `SafeMdxRemote` so malformed content shows an in-page notice instead of crashing the app.
- MDX links are normalized in `src/components/mdx/MdxComponents.tsx`; external links open in a new tab, internal links are locale-prefixed.
- For localized UI, update both `src/i18n/messages/en.json` and `src/i18n/messages/vi.json` when adding visible strings.
- Commit messages are checked by `scripts/commitlint.ts`: use `<type>(optional-scope): <description>`, with allowed types listed in that script.

## Content And Assets

- Notes/projects must use filenames like `2026-01-01_lorem-note.en.mdx`; locale in filename must match frontmatter locale.
- Frontmatter schema for notes/projects is in `src/content/schemas/frontmatter.ts`; page frontmatter schema is in `src/features/pages/content/page-content.schema.ts`.
- Home/About MDX may use only registered page components from `src/features/pages/components/PageMdxComponents.tsx`; see `docs/content-authoring.md`.
- Use `.contentcheckignore` for intentional invalid fixtures or content that the checker should skip. Current benchmark ignore is documented there.
- Static content media belongs in `public/content/...`; placeholders live in `public/content/placeholders`.
- Hero SVGs served by `/api/hero` live in `public/hero/`.

## Hero Banner Generation Prompt

Use this prompt when asking an agent to create or update a hero SVG for a theme:

```text
Create a 1280x640 SVG hero banner for this portfolio using the requested theme from
src/features/theme/theme.config.ts. Read the theme tokens directly from the config and
match the site background treatment from src/styles/globals.css: base background color,
the 24px dotted foreground pattern, grid opacity, and theme atmosphere where applicable.

Use the center text from src/config/site.config.ts siteConfig.author when possible; fall
back to "LOUIS NGUYEN" only if that config value is unavailable. Render the center text
in Consolas/monospace, centered horizontally and vertically, with a subtle looping glow
animation using the theme accent color.

Save the SVG under public/hero/<theme>.svg. Keep the SVG self-contained, 1280x640,
with rounded canvas corners and the existing inner rounded frame style. If the theme has
particles enabled in theme.config.ts, add lightweight SVG/SMIL particles that visually
match the configured preset; if the theme has no particles, do not add particles.

After adding a new hero theme, update src/app/api/hero/route.ts so /api/hero?theme=<id>
can return it when the theme is enabled, and add/update the optional hero config on the
theme definition. Validate the SVG as XML and run the narrowest relevant checks.
```

- Existing examples: `public/hero/dark.svg`, `public/hero/moe.svg`, `public/hero/tet.svg`, `public/hero/winter.svg`.
- Prefer `siteConfig.author` from `src/config/site.config.ts` over hardcoded banner text.
- Keep hero theme ids aligned with `CustomThemeId`, theme `hero.image`, and `/api/hero` aliases.

## Testing Expectations

- Test framework: Bun test (`bun:test`).
- Keep tests in `tests/` with `*.test.ts` or `*.test.tsx` naming.
- Existing tests render React components with `react-dom/server` and assert content/service behavior.
- For UI/content/service changes, run at least `bun run typecheck`, `bun run lint`, and the relevant `bun test ...` command.
- For MDX/frontmatter/content changes, run `bun run content:check` for staged changes or `bun run content:check:all` when checking the full content tree.
- For route/theme/build-sensitive changes, run `bun run build` before calling the work complete.

## Security And Configuration

- Do not commit secrets. `.env` and `.env.*` are ignored except `.env.example`.
- Document new environment variables in `.env.example`. Current examples include `NEXT_PUBLIC_THEME_ENABLE_ALL`, `NEXT_PUBLIC_THEME_PREVIEW`, and `HERO_CACHE_SECONDS`.
- Keep remote image allowances in `next.config.ts`; currently GitHub avatar URLs are allowed.
- MDX normalization strips imports, event handlers, inline styles, and JavaScript URLs in `src/content/mdx/loader.ts`; avoid bypassing this path.
- External links should use `rel="noopener noreferrer"` when opened in a new tab; the MDX link component already does this.

## Change Guidelines

- Keep changes focused; do not refactor unrelated feature folders while solving a narrow task.
- Do not edit generated output such as `.next/`, `node_modules/`, or coverage/build artifacts.
- Update `bun.lock` only when dependency changes require it.
- Preserve locale behavior and English fallback unless the task explicitly changes localization.
- When behavior changes, update tests and relevant docs under `docs/`.
- Prefer reusing existing components and services over adding parallel implementations.

## Pull Request Readiness

- Before handoff, report the commands run and their results.
- Recommended final checks for most code changes: `bun run lint`, `bun run typecheck`, relevant `bun test`, and `bun run build` if routes, config, MDX rendering, or theme behavior changed.
- Run `bun run content:check` when staged MDX/page content changes are involved.
- Mention any skipped checks, environment blockers, or intentional ignored files such as content-check benchmark fixtures.
