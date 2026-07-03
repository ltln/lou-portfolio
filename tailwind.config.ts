import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-muted": "rgb(var(--accent-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgb(var(--foreground) / 0.84)",
            "--tw-prose-headings": "rgb(var(--foreground))",
            "--tw-prose-lead": "rgb(var(--foreground) / 0.72)",
            "--tw-prose-links": "rgb(var(--accent))",
            "--tw-prose-bold": "rgb(var(--foreground))",
            "--tw-prose-counters": "rgb(var(--foreground) / 0.55)",
            "--tw-prose-bullets": "rgb(var(--accent))",
            "--tw-prose-hr": "rgb(var(--border))",
            "--tw-prose-quotes": "rgb(var(--foreground) / 0.78)",
            "--tw-prose-quote-borders": "rgb(var(--accent))",
            "--tw-prose-captions": "rgb(var(--foreground) / 0.6)",
            "--tw-prose-code": "rgb(var(--foreground))",
            "--tw-prose-pre-code": "rgb(var(--foreground))",
            "--tw-prose-pre-bg": "rgb(var(--surface))",
            maxWidth: "none",
            letterSpacing: "0",
            fontSize: "clamp(1rem, 0.96rem + 0.16vw, 1.095rem)",
            lineHeight: "1.82",
            p: {
              marginTop: "1.15rem",
              marginBottom: "1.15rem",
            },
            h1: {
              color: "rgb(var(--foreground))",
              letterSpacing: "0",
            },
            h2: {
              color: "rgb(var(--foreground))",
              letterSpacing: "0",
              scrollMarginTop: "6rem",
            },
            h3: {
              color: "rgb(var(--foreground))",
              letterSpacing: "0",
              scrollMarginTop: "6rem",
            },
            h4: {
              color: "rgb(var(--foreground))",
              letterSpacing: "0",
            },
            pre: {
              margin: "0",
            },
            code: {
              fontWeight: "500",
            },
            blockquote: {
              fontStyle: "normal",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
