# Content authoring

MDX notes live in `content/notes`; project case studies live in `content/projects`.

Home and About page copy lives in localized MDX files:

```text
content/pages/home.en.mdx
content/pages/home.vi.mdx
content/pages/about.en.mdx
content/pages/about.vi.mdx
```

Supported page frontmatter:

```yaml
title:
description:
locale:
translationOf:
published:
```

`title` and `description` generate route metadata. `locale` must match the filename locale. `translationOf` should be `home` or `about`. English is the fallback when a localized page file is missing.

Home/About MDX can use safe registered components only; content files cannot import arbitrary app modules.

```mdx
# Cloud systems, secure delivery, and full-stack products

Introductory page copy.

<ProfileSummary />

<SelectedProjects limit={3} />

<RecentNotes limit={3} />
```

Vietnamese example:

```mdx
# Hệ thống cloud, triển khai an toàn, và sản phẩm full-stack

Đoạn giới thiệu ngắn.

<SelectedProjects limit={3} />
```

Available page components:

- `<ProfileSummary />`: role, focus, and mode from site/message config.
- `<SelectedProjects limit={3} />`: localized featured projects with a featured first case file.
- `<RecentNotes limit={3} />`: localized recent notes using the editorial note card layout.
- `<WideContent>...</WideContent>`: full shell-width content.
- `<Figure />`: content image with optional caption and `wide` support.
- `<Callout>...</Callout>`: restrained technical callout.

Normal Markdown paragraphs stay in the readable article column. Use `WideContent` only when a block should span the wider page shell, such as diagrams, large tables, architecture visuals, or embedded media.

```mdx
<WideContent>
  <pre>{`large diagram or generated output`}</pre>
</WideContent>
```

Use `Figure` for content images. Set `wide` when the image should use the full content shell.

```mdx
<Figure
  src="/content/notes/example/diagram.webp"
  alt="Architecture diagram showing request flow"
  caption="Request flow through the gateway and worker tier."
  wide
/>
```

Keep prose text outside `WideContent` so line length remains comfortable.

## Index filters

Notes index filters are built from localized note frontmatter:

- `title` feeds title search only.
- `tags` feeds the tag multi-select.
- `date` feeds available month filters using `YYYY-MM` query values.

Projects index filters are built from localized project frontmatter:

- `title` feeds title search only.
- `tags`, `stack`, and `focus` feed separate multi-select filters.
- `date` feeds available year filters.

Filter state is stored in the URL, for example:

```text
/en/notes?q=systems&tags=engineering&from=2026-05&to=2026-06
/en/projects?q=faas&tags=security&stack=openfaas&from=2025&to=2026
```
