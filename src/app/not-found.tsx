import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <p className="font-mono text-xs uppercase text-accent">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <Link href="/en" className="mt-6 inline-block font-mono text-xs uppercase text-accent">
        Return home
      </Link>
    </main>
  );
}
