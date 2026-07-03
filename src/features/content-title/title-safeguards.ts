export function titleOrFallback(value: unknown, fallback: string, context: string) {
  const title = typeof value === "string" ? value.trim() : "";
  if (title) return title;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[content-title] Missing title for ${context}; using "${fallback}".`);
  }
  return fallback;
}
