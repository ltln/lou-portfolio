import Image from "next/image";
import { cn } from "@/lib/utils";
import { WideContent } from "./WideContent";

export function Figure({
  src,
  alt,
  caption,
  wide = false,
  position = "center",
}: {
  src: string;
  alt: string;
  caption?: string;
  wide?: boolean;
  position?: string;
}) {
  const frame = (
    <figure className={cn("my-8", wide && "m-0")}>
      <div className="relative aspect-[16/9] overflow-hidden border border-border bg-surface-muted">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={src.endsWith(".svg")}
          sizes={wide ? "(min-width: 1024px) 1180px, 100vw" : "(min-width: 1024px) 860px, 100vw"}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-xs text-foreground/52">{caption}</figcaption>
      ) : null}
    </figure>
  );

  return wide ? <WideContent>{frame}</WideContent> : frame;
}
