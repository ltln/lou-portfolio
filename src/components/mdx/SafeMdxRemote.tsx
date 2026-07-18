import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";

const renderErrorMessage = "The content can't be rendered due to an error in the format...";

export async function SafeMdxRemote(props: MDXRemoteProps) {
  try {
    return await MDXRemote(props);
  } catch (error) {
    console.error("MDX render failed", error);
    return <MdxRenderErrorNotice />;
  }
}

function MdxRenderErrorNotice() {
  return (
    <div
      role="alert"
      className="border border-accent/45 bg-accent-muted/30 p-4 text-sm text-foreground/78"
    >
      <p className="font-medium text-foreground">{renderErrorMessage}</p>
      <p className="mt-2 text-foreground/62">
        Please check the Markdown syntax, frontmatter, code fences, links, and embedded blocks.
      </p>
    </div>
  );
}
