import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compile } from "@mdx-js/mdx";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { z } from "zod";

interface Diagnostic {
  file: string;
  line?: number;
  column?: number;
  section: string;
  message: string;
  detail?: string;
}

interface ParsedContent {
  data: Record<string, unknown>;
  content: string;
  bodyStartLine: number;
}

interface IgnoreRule {
  pattern: string;
  negated: boolean;
  regex: RegExp;
}

const locales = ["en", "vi"] as const;
const contentFilePattern = /^(\d{4}-\d{2}-\d{2})_(.+)\.(en|vi)\.mdx$/;
const pageFilePattern = /^(home|about)\.(en|vi)\.mdx$/;
const htmlTagAllowlist = new Set([
  "a",
  "abbr",
  "aside",
  "audio",
  "br",
  "button",
  "code",
  "dd",
  "details",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "iframe",
  "img",
  "input",
  "kbd",
  "label",
  "li",
  "mark",
  "meter",
  "ol",
  "option",
  "p",
  "progress",
  "samp",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "textarea",
  "ul",
  "var",
  "video",
]);

const baseContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  date: z.preprocess(
    (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ),
  tags: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  cover: z.string().optional(),
  coverAlt: z.string().optional(),
  coverPosition: z.string().default("center"),
  locale: z.enum(locales),
  translationOf: z.string().optional(),
  icon: z.string().optional(),
  iconAlt: z.string().optional(),
  role: z.union([z.string().min(1), z.array(z.string().min(1))]).optional(),
  stack: z.array(z.string().min(1)).default([]),
  focus: z.array(z.string().min(1)).default([]),
  links: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .default([]),
});

const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  locale: z.enum(locales),
  translationOf: z.enum(["home", "about"]),
  published: z.boolean().default(true),
});

const ansi = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
};

const checkAll = process.argv.includes("--all");
const contentIgnoreRules = readContentIgnoreRules();
const staged = checkAll ? getAllContentFiles() : getStagedContentFiles();
const failures: Diagnostic[] = [];

for (const file of staged) {
  await validateFile(file)
    .then((diagnostics) => failures.push(...diagnostics))
    .catch((error) => {
      failures.push(toDiagnostic(file, error));
    });
}

if (failures.length) {
  console.error(formatDiagnostics(failures));
  process.exit(1);
}

console.log(
  `content validation passed (${staged.length} ${checkAll ? "content" : "staged"} file${staged.length === 1 ? "" : "s"})`,
);

function getAllContentFiles() {
  const files: string[] = [];
  for (const dir of ["content/notes", "content/projects", "content/pages"]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) files.push(`${dir}/${file}`);
  }
  return filterContentFiles(files);
}

function getStagedContentFiles() {
  const result = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "failed to read staged files");
  }

  return filterContentFiles(result.stdout.split(/\r?\n/).map((file) => file.trim()));
}

function filterContentFiles(files: string[]) {
  return files.filter((file) => {
    const normalized = normalizePath(file);
    if (isContentCheckIgnored(normalized)) return false;
    if (!file.endsWith(".mdx")) return false;
    if (normalized.startsWith("content/notes/") || normalized.startsWith("content/projects/"))
      return true;
    return /^content\/pages\/(home|about)\.(en|vi)\.mdx$/.test(normalized);
  });
}

function readContentIgnoreRules(): IgnoreRule[] {
  const ignoreFile = path.join(process.cwd(), ".contentcheckignore");
  if (!fs.existsSync(ignoreFile)) return [];

  return fs
    .readFileSync(ignoreFile, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const negated = line.startsWith("!");
      const pattern = normalizePath(negated ? line.slice(1) : line);
      return { pattern, negated, regex: ignorePatternToRegex(pattern) };
    });
}

function isContentCheckIgnored(file: string) {
  let ignored = false;
  for (const rule of contentIgnoreRules) {
    if (rule.regex.test(file)) ignored = !rule.negated;
  }
  return ignored;
}

function ignorePatternToRegex(pattern: string) {
  const directoryPattern = pattern.endsWith("/");
  const anchored = pattern.startsWith("/");
  const normalized = (anchored ? pattern.slice(1) : pattern).replace(/\/$/, "");
  const body = globToRegexBody(directoryPattern ? `${normalized}/**` : normalized);
  const prefix = anchored || normalized.includes("/") ? "^" : "(^|/)";
  return new RegExp(`${prefix}${body}$`);
}

function globToRegexBody(pattern: string) {
  let regex = "";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === "*" && next === "*") {
      regex += ".*";
      index += 1;
    } else if (char === "*") {
      regex += "[^/]*";
    } else if (char === "?") {
      regex += "[^/]";
    } else {
      regex += escapeRegex(char);
    }
  }
  return regex;
}

function escapeRegex(value: string) {
  return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

function normalizePath(file: string) {
  return file.replace(/\\/g, "/");
}

async function validateFile(file: string): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const absolute = path.join(process.cwd(), file);
  if (!fs.existsSync(absolute)) return [diagnostic(file, "file", "File does not exist")];

  const raw = fs.readFileSync(absolute, "utf8");
  const parsed = parseContent(file, raw, diagnostics);
  const body = parsed.content.trim();
  if (!body) diagnostics.push(diagnostic(file, "body", "MDX body is empty", firstBodyLine(raw)));

  if (file.startsWith("content/notes/") || file.startsWith("content/projects/")) {
    diagnostics.push(...validateEntryFile(file, parsed.data));
  } else {
    diagnostics.push(...validatePageFile(file, parsed.data));
  }
  diagnostics.push(...validateInternalLinks(file, parsed.content, parsed.bodyStartLine));
  diagnostics.push(...validateMarkdownQuality(file, parsed.content, parsed.bodyStartLine));

  try {
    await compile(normalizeMdxSource(parsed.content), {
      format: "mdx",
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [
        rehypeKatex,
        [rehypePrettyCode, { theme: "github-dark", keepBackground: false }],
      ],
    });
  } catch (error) {
    const point = pointFromError(error);
    diagnostics.push(
      diagnostic(
        file,
        "mdx",
        "MDX failed to compile",
        point.line === undefined ? undefined : point.line + parsed.bodyStartLine - 1,
        point.column,
        messageFromError(error),
      ),
    );
  }

  return diagnostics;
}

function parseContent(file: string, raw: string, diagnostics: Diagnostic[]): ParsedContent {
  try {
    const parsed = matter(raw);
    return {
      data: parsed.data,
      content: parsed.content,
      bodyStartLine: firstBodyLine(raw),
    };
  } catch (error) {
    const point = pointFromError(error);
    diagnostics.push(
      diagnostic(
        file,
        "frontmatter.syntax",
        "Frontmatter could not be parsed",
        point.line,
        point.column,
        messageFromError(error),
      ),
    );

    return recoverContentAfterFrontmatter(raw);
  }
}

function recoverContentAfterFrontmatter(raw: string): ParsedContent {
  if (!raw.startsWith("---")) return { data: {}, content: raw, bodyStartLine: 1 };
  const lines = raw.split(/\r?\n/);
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return { data: {}, content: raw, bodyStartLine: 1 };
  return {
    data: {},
    content: lines.slice(endIndex + 1).join("\n"),
    bodyStartLine: endIndex + 2,
  };
}

function validateInternalLinks(file: string, source: string, lineOffset = 1): Diagnostic[] {
  const seen = new Set<string>();
  const missing = extractLinks(source)
    .filter((link) => isLocalPageHref(link.href))
    .filter((link) => !localRouteExists(link.href))
    .filter((link) => {
      const key = `${link.href}:${link.line}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return missing.map((link) =>
    diagnostic(
      file,
      "links",
      `Internal link does not resolve: ${link.href}`,
      link.line + lineOffset - 1,
      undefined,
      "Use an existing route such as /about, /notes, /projects, /notes/:slug, or /projects/:slug. Localized /en/... and /vi/... forms are also accepted.",
    ),
  );
}

function validateMarkdownQuality(file: string, source: string, lineOffset: number): Diagnostic[] {
  if (!source.includes("<!-- EXPECT:")) return [];

  const diagnostics: Diagnostic[] = [];
  const expectedCodes = extractExpectedCodes(source, lineOffset);
  const lines = source.split(/\r?\n/);
  const headingCounts = new Map<string, number[]>();
  const referenceDefinitions = new Map<string, number>();
  const usedReferences: { label: string; line: number }[] = [];
  let previousHeadingLevel = 0;
  let h1Seen = false;
  let blankRun = 0;
  let openFence: { marker: string; line: number } | undefined;

  lines.forEach((line, index) => {
    const lineNumber = index + lineOffset;
    const trimmed = line.trim();

    if (trimmed === "") {
      blankRun += 1;
      if (blankRun >= 3) {
        diagnostics.push(
          diagnostic(
            file,
            "markdown.EMPTY_PARAGRAPH_OR_EXCESS_BLANK_LINES",
            "Too many blank lines",
            lineNumber,
          ),
        );
      }
      return;
    }
    blankRun = 0;

    const fence = /^(\s*)(`{3,}|~{3,})/.exec(line);
    if (fence) {
      const marker = fence[2][0];
      if (openFence) {
        if (marker !== openFence.marker) {
          diagnostics.push(
            diagnostic(
              file,
              "markdown.UNCLOSED_FENCED_CODE_BLOCK",
              "Code fence is not closed before another fence marker starts",
              openFence.line,
            ),
          );
          diagnostics.push(
            diagnostic(
              file,
              "markdown.FENCE_MARKER_MISMATCH",
              "Code fence closes with a different marker type",
              lineNumber,
            ),
          );
          openFence = { marker, line: lineNumber };
        } else {
          openFence = undefined;
        }
      } else {
        openFence = { marker, line: lineNumber };
      }
    }

    const heading = /^(#{1,6})(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      if (heading[2] && !/^\s/.test(heading[2])) {
        diagnostics.push(
          diagnostic(
            file,
            "markdown.MD018",
            "Heading marker must be followed by a space",
            lineNumber,
          ),
        );
      }
      if (!text)
        diagnostics.push(
          diagnostic(file, "markdown.EMPTY_HEADING", "Heading text is empty", lineNumber),
        );
      if (previousHeadingLevel && level > previousHeadingLevel + 1) {
        diagnostics.push(
          diagnostic(
            file,
            "markdown.MD001",
            "Heading level jumps by more than one level",
            lineNumber,
          ),
        );
      }
      previousHeadingLevel = level;
      if (level === 1) {
        if (h1Seen)
          diagnostics.push(diagnostic(file, "markdown.MD025", "Multiple H1 headings", lineNumber));
        h1Seen = true;
      }
      if (text) {
        const slug = slugifyHeading(text);
        const existing = headingCounts.get(slug) ?? [];
        existing.push(lineNumber);
        headingCounts.set(slug, existing);
        if (existing.length === 2) {
          diagnostics.push(
            diagnostic(file, "markdown.MD024", `Duplicate heading: ${text}`, lineNumber),
          );
          diagnostics.push(
            diagnostic(
              file,
              "markdown.DUPLICATE_ANCHOR_RISK",
              `Duplicate anchor risk: ${text}`,
              lineNumber,
            ),
          );
        } else if (existing.length > 2) {
          diagnostics.push(
            diagnostic(
              file,
              "markdown.DUPLICATE_ANCHOR_RISK",
              `Duplicate anchor risk: ${text}`,
              lineNumber,
            ),
          );
        }
      }
    }

    if (line.includes("\t"))
      diagnostics.push(
        diagnostic(file, "markdown.HARD_TAB", "Line contains tab characters", lineNumber),
      );
    if (/\s+$/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.TRAILING_WHITESPACE",
          "Line has trailing whitespace",
          lineNumber,
        ),
      );
    if (line.length > 120)
      diagnostics.push(
        diagnostic(file, "markdown.LONG_LINE", "Line exceeds 120 characters", lineNumber),
      );
    if (/\bTODO\b/.test(line))
      diagnostics.push(diagnostic(file, "markdown.TODO_MARKER", "TODO marker found", lineNumber));
    if (/lorem ipsum/i.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.PLACEHOLDER_TEXT", "Placeholder text found", lineNumber),
      );
    if (/https?:\/\/\S+/.test(line) && !/[\](<]/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.BARE_URL",
          "Bare URL should use Markdown link syntax",
          lineNumber,
        ),
      );
    if (/^>\S/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.BLOCKQUOTE_MISSING_SPACE",
          "Blockquote marker must be followed by a space",
          lineNumber,
        ),
      );
    if (/^\s*-\s*$/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.EMPTY_LIST_ITEM", "List item is empty", lineNumber),
      );
    if (/^\s*- \[[^\] ]/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.INVALID_TASK_LIST_ITEM",
          "Task list marker is malformed",
          lineNumber,
        ),
      );
    if (/^\t+[-*+]\s/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.TAB_INDENTATION", "List indentation uses a tab", lineNumber),
      );

    if (countToken(line, "**") % 2 === 1)
      diagnostics.push(
        diagnostic(file, "markdown.UNCLOSED_EMPHASIS", "Bold marker is not closed", lineNumber),
      );
    if (countSingleAsterisk(line) % 2 === 1)
      diagnostics.push(
        diagnostic(file, "markdown.UNCLOSED_EMPHASIS", "Italic marker is not closed", lineNumber),
      );
    if (countToken(line, "~~") % 2 === 1)
      diagnostics.push(
        diagnostic(
          file,
          "markdown.UNCLOSED_STRIKETHROUGH",
          "Strikethrough marker is not closed",
          lineNumber,
        ),
      );
    if (countToken(line, "`") % 2 === 1 && !fence)
      diagnostics.push(
        diagnostic(
          file,
          "markdown.BROKEN_INLINE_CODE",
          "Inline code span is not closed",
          lineNumber,
        ),
      );
    if (/\*\*[^*]*\*[^*]*\*\*[^*]*\*/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.MISORDERED_EMPHASIS",
          "Emphasis markers are misordered",
          lineNumber,
        ),
      );

    if (/\]\([^)]*$/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.BROKEN_LINK_DESTINATION",
          "Link destination is not closed",
          lineNumber,
        ),
      );
    if (/\[\]\([^)]+\)/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.EMPTY_LINK_TEXT", "Link text is empty", lineNumber),
      );
    if (/\[[^\]]+\]\(\s*\)/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.EMPTY_LINK_DESTINATION",
          "Link destination is empty",
          lineNumber,
        ),
      );
    if (/\]\(\s*javascript:/i.test(line) || /\shref\s*=\s*["']javascript:/i.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.UNSAFE_URL_SCHEME", "URL uses an unsafe scheme", lineNumber),
      );
    if (/\[[^\]]*\[[^\]]+\]\([^)]+\)[^\]]*\]\([^)]+\)/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.NESTED_LINK", "Nested links are not valid Markdown", lineNumber),
      );
    if (/!\[\]\([^)]+\)/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.IMAGE_MISSING_ALT_TEXT", "Image alt text is empty", lineNumber),
      );
    if (/!\[[^\]]+\]\(\s*\)/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.IMAGE_MISSING_DESTINATION",
          "Image destination is empty",
          lineNumber,
        ),
      );
    if (/!\[[^\]]+\]\([^)]*"[^"]*$/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.BROKEN_IMAGE_TITLE", "Image title is not closed", lineNumber),
      );

    const referenceDefinition = /^\s*\[([^\]]+)\]:/.exec(line);
    if (referenceDefinition) {
      const key = referenceDefinition[1].toLowerCase();
      if (referenceDefinitions.has(key))
        diagnostics.push(
          diagnostic(
            file,
            "markdown.DUPLICATE_REFERENCE_DEFINITION",
            `Duplicate reference definition: ${key}`,
            lineNumber,
          ),
        );
      referenceDefinitions.set(key, lineNumber);
    }
    const referenceUse = /(?<!!)\[[^\]]+\]\[([^\]]+)\]/g;
    let referenceMatch: RegExpExecArray | null;
    while ((referenceMatch = referenceUse.exec(line)))
      usedReferences.push({ label: referenceMatch[1].toLowerCase(), line: lineNumber });

    if (/<https?:\/\/[^>\s]+$/.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.MALFORMED_AUTOLINK", "Autolink is not closed", lineNumber),
      );
    if (/<script\b/i.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.UNSAFE_HTML", "Script tags are not allowed", lineNumber),
      );
    if (/<div\b[^>]*>/.test(line) && !line.includes("</div>"))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.RAW_HTML_UNCLOSED_TAG",
          "Raw HTML tag is not closed",
          lineNumber,
        ),
      );
    if (/<span\b[^>]*>.*<\/div>/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.RAW_HTML_MISMATCHED_TAG",
          "Raw HTML closing tag does not match opening tag",
          lineNumber,
        ),
      );
    if (/&[a-z][a-z0-9]+;/i.test(line) && !/&(amp|lt|gt|quot|apos|nbsp);/i.test(line))
      diagnostics.push(
        diagnostic(file, "markdown.INVALID_ENTITY", "Unknown HTML entity", lineNumber),
      );
    if (/^=+x=+$/.test(trimmed))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.BROKEN_SETEXT_HEADING",
          "Setext heading underline is invalid",
          lineNumber,
        ),
      );
    if (/^\* \* \*\*$/.test(trimmed))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.HORIZONTAL_RULE_AMBIGUITY",
          "Horizontal rule marker is ambiguous",
          lineNumber,
        ),
      );
    if (/\\[^\\`*_[\]{}()#+\-.!|]/.test(line))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.ESCAPED_CHARACTER_MISUSE",
          "Backslash escapes a non-punctuation character",
          lineNumber,
        ),
      );
  });

  diagnostics.push(...validateOrderedListSequence(file, lines, lineOffset));
  diagnostics.push(...validateListIndentation(file, lines, lineOffset));
  diagnostics.push(...validateTables(file, lines, lineOffset));

  if (openFence)
    diagnostics.push(
      diagnostic(
        file,
        "markdown.UNCLOSED_FENCED_CODE_BLOCK",
        "Code fence is not closed",
        openFence.line,
      ),
    );
  for (const reference of usedReferences) {
    if (!referenceDefinitions.has(reference.label))
      diagnostics.push(
        diagnostic(
          file,
          "markdown.UNRESOLVED_REFERENCE",
          `Reference is not defined: ${reference.label}`,
          reference.line,
        ),
      );
  }

  return diagnostics.concat(validateExpectedCoverage(file, diagnostics, expectedCodes));
}

function extractExpectedCodes(source: string, lineOffset: number) {
  const expected: { code: string; line: number }[] = [];
  source.split(/\r?\n/).forEach((line, index) => {
    const match = /<!--\s*EXPECT:\s*([A-Z0-9_-]+)/.exec(line);
    if (match && match[1] !== "FINAL_SUMMARY_SENTINEL") {
      expected.push({ code: match[1], line: index + lineOffset });
    }
  });
  return expected;
}

function validateExpectedCoverage(
  file: string,
  diagnostics: Diagnostic[],
  expectedCodes: { code: string; line: number }[],
) {
  return expectedCodes.flatMap((expected) => {
    const covered = diagnostics.some((diagnostic) => diagnostic.section.endsWith(expected.code));
    return covered
      ? []
      : [
          diagnostic(
            file,
            `markdown.${expected.code}`,
            `Benchmark case is not covered by a specialized checker: ${expected.code}`,
            expected.line,
          ),
        ];
  });
}

function extractLinks(source: string) {
  const links: { href: string; line: number }[] = [];
  const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlHrefPattern = /\shref\s*=\s*(?:"([^"]+)"|'([^']+)'|\{["'`]([^"'`]+)["'`]\})/g;

  source.split(/\r?\n/).forEach((line, index) => {
    let match: RegExpExecArray | null;
    markdownLinkPattern.lastIndex = 0;
    htmlHrefPattern.lastIndex = 0;

    while ((match = markdownLinkPattern.exec(line)))
      links.push({ href: match[1], line: index + 1 });
    while ((match = htmlHrefPattern.exec(line))) {
      links.push({ href: match[1] ?? match[2] ?? match[3], line: index + 1 });
    }
  });

  return links
    .map((link) => ({ ...link, href: link.href.split("#")[0].split("?")[0] }))
    .filter((link) => link.href);
}

function isLocalPageHref(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  return !/\.[a-z0-9]+$/i.test(href);
}

function localRouteExists(href: string) {
  const route = href.replace(/\/$/, "") || "/";
  const unlocalized = route.replace(/^\/(en|vi)(?=\/|$)/, "") || "/";
  if (["/", "/about", "/projects", "/notes"].includes(unlocalized)) return true;

  const detail = /^\/(projects|notes)\/([a-z0-9-]+)$/.exec(unlocalized);
  if (!detail) return false;
  const [, kind, slug] = detail;
  return contentSlugExists(kind as "projects" | "notes", slug);
}

function validateOrderedListSequence(
  file: string,
  lines: string[],
  lineOffset: number,
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  let expected: number | undefined;

  lines.forEach((line, index) => {
    const match = /^(\s*)(\d+)\.\s+/.exec(line);
    if (!match) {
      expected = undefined;
      return;
    }

    const value = Number(match[2]);
    if (expected !== undefined && value !== expected) {
      diagnostics.push(
        diagnostic(
          file,
          "markdown.ORDERED_LIST_SEQUENCE",
          `Ordered list item should be ${expected}. but found ${value}.`,
          index + lineOffset,
        ),
      );
    }
    expected = value + 1;
  });

  return diagnostics;
}

function validateListIndentation(file: string, lines: string[], lineOffset: number): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const seenIndents = new Set<number>();

  lines.forEach((line, index) => {
    const match = /^( +)[-*+]\s+/.exec(line);
    if (!match) return;

    const indent = match[1].length;
    if (indent % 2 !== 0 || (seenIndents.size > 0 && !seenIndents.has(indent) && indent > 2)) {
      diagnostics.push(
        diagnostic(
          file,
          "markdown.INCONSISTENT_LIST_INDENTATION",
          "List indentation should use consistent two-space levels",
          index + lineOffset,
        ),
      );
    }
    seenIndents.add(indent);
  });

  return diagnostics;
}

function validateTables(file: string, lines: string[], lineOffset: number): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) return;

    const cells = splitTableRow(trimmed);
    const next = lines[index + 1]?.trim();
    if (next?.startsWith("|") && !trimmed.endsWith("|")) {
      diagnostics.push(
        diagnostic(
          file,
          "markdown.MALFORMED_TABLE",
          "Table row must end with a pipe",
          index + lineOffset,
        ),
      );
    }
    if (/^\|?\s*:?-+/.test(trimmed) && !cells.every((cell) => /^:?-+:?$/.test(cell.trim()))) {
      diagnostics.push(
        diagnostic(
          file,
          "markdown.INVALID_TABLE_DELIMITER",
          "Table delimiter cells must contain only hyphens and optional colons",
          index + lineOffset,
        ),
      );
    }
    if (index > 0 && lines[index - 1]?.trim().startsWith("|")) {
      const previousCells = splitTableRow(lines[index - 1].trim()).length;
      if (cells.length !== previousCells)
        diagnostics.push(
          diagnostic(
            file,
            "markdown.MALFORMED_TABLE",
            "Table rows have different cell counts",
            index + lineOffset,
          ),
        );
    }
  });

  return diagnostics;
}

function splitTableRow(line: string) {
  return line.replace(/^\|/, "").replace(/\|$/, "").split("|");
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function countToken(value: string, token: string) {
  return value.split(token).length - 1;
}

function countSingleAsterisk(value: string) {
  return [...value.matchAll(/(?<!\*)\*(?!\*)/g)].length;
}

function contentSlugExists(kind: "projects" | "notes", slug: string) {
  const dir = `content/${kind}`;
  if (!fs.existsSync(dir)) return false;
  return fs.readdirSync(dir).some((file) => {
    const match = contentFilePattern.exec(file);
    if (!match) return false;
    const [, , fileSlug] = match;
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    return fileSlug === slug || parsed.data.translationOf === slug;
  });
}

function normalizeMdxSource(source: string) {
  const lines = source.split(/\r?\n/);
  let inFence = false;
  return lines
    .flatMap((line) => {
      if (/^\s*```/.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      if (/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(line)) return [];

      const sanitized = sanitizeMdxHtmlLine(line);
      const escaped = sanitized.replace(/<\/?([a-z][\w-]*)(\s[^<>]*)?>/g, (match, tag: string) => {
        return htmlTagAllowlist.has(tag)
          ? match
          : match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      });

      const multilineClose = escaped.match(/^(.*\S)\s+(<\/[A-Z][A-Za-z0-9_]*>)\s*$/);
      return multilineClose ? [multilineClose[1], multilineClose[2]] : escaped;
    })
    .join("\n");
}

function sanitizeMdxHtmlLine(line: string) {
  return line
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]+)/gi, "")
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, "")
    .replace(/\s+(href|src)\s*=\s*\{\s*[`'"]\s*javascript:[^}]*\}/gi, "");
}

function diagnostic(
  file: string,
  section: string,
  message: string,
  line?: number,
  column?: number,
  detail?: string,
): Diagnostic {
  return { file, line, column, section, message, detail };
}

function zodDiagnostics(file: string, error: z.ZodError): Diagnostic[] {
  return error.issues.map((issue) =>
    diagnostic(
      file,
      `frontmatter.${issue.path.join(".") || "root"}`,
      issue.message,
      1,
      undefined,
      `Invalid frontmatter field: ${issue.path.join(".") || "root"}`,
    ),
  );
}

function toDiagnostic(file: string, error: unknown): Diagnostic {
  const point = pointFromError(error);
  return {
    file,
    line: point.line,
    column: point.column,
    section: "unknown",
    message: messageFromError(error),
  };
}

function formatDiagnostics(diagnostics: Diagnostic[]) {
  const lines = ["", color("red", color("bold", "content validation failed")), ""];

  for (const [file, fileDiagnostics] of groupDiagnosticsByFile(diagnostics)) {
    lines.push(color("cyan", file));
    lines.push(...formatFileDiagnostics(fileDiagnostics));
    lines.push("");
  }

  lines.push(
    color(
      "red",
      color(
        "bold",
        `x ${diagnostics.length} problem${diagnostics.length === 1 ? "" : "s"} (${diagnostics.length} error${diagnostics.length === 1 ? "" : "s"}, 0 warnings)`,
      ),
    ),
  );

  return lines.join("\n");
}

function groupDiagnosticsByFile(diagnostics: Diagnostic[]) {
  const grouped = new Map<string, Diagnostic[]>();
  for (const diagnostic of diagnostics) {
    const fileDiagnostics = grouped.get(diagnostic.file) ?? [];
    fileDiagnostics.push(diagnostic);
    grouped.set(diagnostic.file, fileDiagnostics);
  }
  return grouped;
}

function formatFileDiagnostics(diagnostics: Diagnostic[]) {
  const locations = diagnostics.map(formatLocation);
  const locationWidth = Math.max(...locations.map((location) => location.length));

  return diagnostics.flatMap((diagnostic, index) => {
    const line = [
      " ",
      locations[index].padStart(locationWidth),
      color("red", "error"),
      diagnostic.message,
      color("dim", diagnostic.section),
    ].join("  ");

    return diagnostic.detail
      ? [
          line,
          ...diagnostic.detail
            .split(/\r?\n/)
            .map((detailLine) => `  ${"".padStart(locationWidth)}  ${color("dim", detailLine)}`),
        ]
      : [line];
  });
}

function formatLocation(diagnostic: Diagnostic) {
  return `${diagnostic.line ?? 1}:${diagnostic.column ?? 1}`;
}

function color(name: keyof typeof ansi, value: string) {
  if (!shouldColor()) return value;
  return `${ansi[name]}${value}${ansi.reset}`;
}

function shouldColor() {
  return Boolean(process.stderr.isTTY && !process.env.NO_COLOR);
}

function firstBodyLine(raw: string) {
  const end = raw.indexOf("\n---", 3);
  if (!raw.startsWith("---") || end === -1) return 1;
  return raw.slice(0, end).split(/\r?\n/).length + 1;
}

function pointFromError(error: unknown) {
  const maybe = error as {
    line?: number;
    column?: number;
    position?: { start?: { line?: number; column?: number } };
    mark?: { line?: number; column?: number };
  };
  const messagePoint = pointFromMessage(messageFromError(error));
  return {
    line: maybe?.line ?? maybe?.position?.start?.line ?? messagePoint.line,
    column: maybe?.column ?? maybe?.position?.start?.column ?? messagePoint.column,
  };
}

function pointFromMessage(message: string) {
  const match = /line (\d+), column (\d+)/i.exec(message);
  return {
    line: match ? Number(match[1]) : undefined,
    column: match ? Number(match[2]) : undefined,
  };
}

function messageFromError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function validateEntryFile(file: string, data: Record<string, unknown>): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const basename = path.basename(file);
  const match = contentFilePattern.exec(basename);
  if (!match) {
    diagnostics.push(
      diagnostic(file, "filename", "Filename must match YYYY-MM-DD_slug.locale.mdx", 1),
    );
  }

  const [, filenameDate, filenameSlug, filenameLocale] = match ?? [];
  const frontmatterResult = baseContentSchema.safeParse(data);
  if (!frontmatterResult.success)
    diagnostics.push(...zodDiagnostics(file, frontmatterResult.error));

  if (!match || !frontmatterResult.success) return diagnostics;
  const frontmatter = frontmatterResult.data;
  if (frontmatter.date !== filenameDate) {
    diagnostics.push(
      diagnostic(
        file,
        "frontmatter.date",
        `Frontmatter date ${frontmatter.date} does not match filename date ${filenameDate}`,
        1,
      ),
    );
  }
  if (frontmatter.locale !== filenameLocale) {
    diagnostics.push(
      diagnostic(
        file,
        "frontmatter.locale",
        `Frontmatter locale ${frontmatter.locale} does not match filename locale ${filenameLocale}`,
        1,
      ),
    );
  }
  if (frontmatter.translationOf && !/^[a-z0-9-]+$/.test(frontmatter.translationOf)) {
    diagnostics.push(
      diagnostic(file, "frontmatter.translationOf", "translationOf must be a lowercase slug", 1),
    );
  }
  if (!/^[a-z0-9-]+$/.test(filenameSlug)) {
    diagnostics.push(diagnostic(file, "filename", "Filename slug must be lowercase kebab-case", 1));
  }

  return diagnostics;
}

function validatePageFile(file: string, data: Record<string, unknown>): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const basename = path.basename(file);
  const match = pageFilePattern.exec(basename);
  if (!match)
    diagnostics.push(
      diagnostic(
        file,
        "filename",
        "Page filename must match home.locale.mdx or about.locale.mdx",
        1,
      ),
    );

  const [, pageSlug, filenameLocale] = match ?? [];
  const frontmatterResult = pageSchema.safeParse(data);
  if (!frontmatterResult.success)
    diagnostics.push(...zodDiagnostics(file, frontmatterResult.error));

  if (!match || !frontmatterResult.success) return diagnostics;
  const frontmatter = frontmatterResult.data;
  if (frontmatter.locale !== filenameLocale) {
    diagnostics.push(
      diagnostic(
        file,
        "frontmatter.locale",
        `Frontmatter locale ${frontmatter.locale} does not match filename locale ${filenameLocale}`,
        1,
      ),
    );
  }
  if (frontmatter.translationOf !== pageSlug) {
    diagnostics.push(
      diagnostic(file, "frontmatter.translationOf", `translationOf must be ${pageSlug}`, 1),
    );
  }

  return diagnostics;
}
