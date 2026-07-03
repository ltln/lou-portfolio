import { ContentTagBadge } from "./ContentTagBadge";

export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag} className="flex">
          <ContentTagBadge tag={tag} />
        </li>
      ))}
    </ul>
  );
}
