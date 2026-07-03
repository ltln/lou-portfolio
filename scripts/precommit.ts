import { spawnSync } from "node:child_process";

interface Check {
  name: string;
  args: string[];
}

const checks: Check[] = [
  { name: "format", args: ["run", "format"] },
  { name: "lint", args: ["run", "lint"] },
  { name: "typecheck", args: ["run", "typecheck"] },
  { name: "test", args: ["test"] },
];

for (const check of checks) {
  run(check);
}

console.log("\nprecommit passed\n");

function run(check: Check) {
  console.log(`\nprecommit: ${check.name}`);
  const result = spawnSync("bun", check.args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`\nprecommit failed at ${check.name}\n`);
    process.exit(result.status ?? 1);
  }
}
