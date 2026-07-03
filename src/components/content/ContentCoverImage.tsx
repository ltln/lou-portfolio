import Image from "next/image";
import { ContentMediaFrame } from "./ContentMediaFrame";

export function ContentCoverImage({
  src,
  alt,
  position = "center",
  priority = false,
  className,
}: {
  src?: string;
  alt?: string;
  position?: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) return null;
  const imageSrc = src;
  const isSvg = imageSrc.endsWith(".svg");

  return (
    <ContentMediaFrame className={className}>
      <div className="relative aspect-[16/7] w-full">
        <Image
          src={imageSrc}
          alt={alt ?? ""}
          fill
          priority={priority}
          unoptimized={isSvg}
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
    </ContentMediaFrame>
  );
}
