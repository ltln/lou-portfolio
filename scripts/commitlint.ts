import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const allowedTypes = new Set([
  "build",
  "chore",
  "ci",
  "docs",
  "feat",
  "fix",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
]);

function messagePath() {
  return process.argv[2] ?? join(process.cwd(), ".git", "COMMIT_EDITMSG");
}

function readMessage(path: string) {
  if (!existsSync(path)) fail(`Commit message file not found: ${path}`);
  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((line) => line.trim() && !line.startsWith("#"))
    ?.trim();
}

function isGeneratedCommit(message: string) {
  return /^(Merge|Revert|fixup!|squash!)/.test(message);
}

function validate(message: string) {
  if (isGeneratedCommit(message)) return;

  const match = /^([a-z]+)(\([a-z0-9-]+\))?(!)?: (.+)$/.exec(message);
  if (!match) failHelp(message);

  const [, type, , , subject] = match;
  if (!allowedTypes.has(type))
    fail(`Unsupported commit type "${type}". Allowed: ${allowedTypesList()}`);
  if (subject.length > 100) fail("Commit subject must be 100 characters or fewer.");
  if (/\.$/.test(subject)) fail("Commit subject should not end with a period.");
}

function allowedTypesList() {
  return Array.from(allowedTypes).join(", ");
}

function failHelp(message: string): never {
  fail(
    [
      `Invalid commit message: ${message}`,
      "Expected: <type>(optional-scope): <description>",
      `Types: ${allowedTypesList()}`,
      "Examples:",
      "  feat: add localized note filters",
      "  fix(theme): restore persisted custom theme",
    ].join("\n"),
  );
}

function fail(message: string): never {
  console.error(`\ncommitlint failed\n${message}\n`);
  process.exit(1);
}

const message = readMessage(messagePath());
if (!message) fail("Commit message is empty.");
validate(message);
console.log("commitlint passed");
