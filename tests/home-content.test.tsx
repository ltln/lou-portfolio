import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentTagBadge } from "../src/components/ui/ContentTagBadge";
import { NoteList } from "../src/features/notes/components/NoteList";
import { getNotes } from "../src/features/notes/notes.service";
import { SelectedProjectCard } from "../src/features/projects/components/SelectedProjectCard";
import { getFeaturedProjects } from "../src/features/projects/projects.service";
import { getMessages } from "../src/i18n/request";

describe("placeholder content rendering", () => {
  const messages = getMessages("en");

  test("only one featured project is published", () => {
    const projects = getFeaturedProjects("en");
    expect(projects).toHaveLength(1);
    expect(projects[0].frontmatter.title).toBe("Lorem ipsum project");
  });

  test("selected project renders lorem title and structure", () => {
    const project = getFeaturedProjects("en")[0];
    const html = renderToStaticMarkup(
      <SelectedProjectCard
        project={project}
        locale="en"
        messages={messages}
        index={0}
        variant="featured"
      />,
    );
    expect(html).toContain("Lorem ipsum project");
    expect(html).toContain("FEATURED / PROJECT_01");
    for (const token of ["data-selected-project-card", "<h3", "<dl", "<dt", "<ul"]) {
      expect(html).toContain(token);
    }
  });

  test("content tag badge uses a fixed non-wrapping height", () => {
    const html = renderToStaticMarkup(<ContentTagBadge tag="Lorem" />);
    expect(html).toContain("inline-flex");
    expect(html).toContain("h-7");
    expect(html).toContain("items-center");
    expect(html).toContain("whitespace-nowrap");
  });

  test("lorem note is published and renders without cover", () => {
    const notes = getNotes("en");
    const note = notes.find((entry) => entry.canonicalSlug === "lorem-note");
    expect(note?.frontmatter.title).toBe("Lorem ipsum note");
    expect(note?.frontmatter.cover).toBeUndefined();
    const html = renderToStaticMarkup(<NoteList notes={notes} locale="en" messages={messages} />);
    expect(html).toContain("Lorem ipsum note");
  });

  test("Vietnamese content falls back to the lorem English project and note", () => {
    expect(
      getNotes("vi").find((entry) => entry.canonicalSlug === "lorem-note")?.frontmatter.title,
    ).toBe("Lorem ipsum note");
    expect(getFeaturedProjects("vi")[0].frontmatter.title).toBe("Lorem ipsum project");
  });
});
