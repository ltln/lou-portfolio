import Image from "next/image";

const placeholder = "/content/placeholders/project-icon-placeholder.svg";

export function ProjectIcon({ src, alt }: { src?: string; alt?: string }) {
  const imageSrc = src ?? placeholder;
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border bg-surface-muted md:h-20 md:w-20">
      <Image
        src={imageSrc}
        alt={src ? (alt ?? "") : "Project icon placeholder"}
        fill
        unoptimized={imageSrc.endsWith(".svg")}
        sizes="80px"
        className="object-contain p-3"
      />
    </div>
  );
}
