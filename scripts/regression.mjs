import { mkdirSync, writeFileSync } from "node:fs";
import { runChecks } from "./lib/run-checks.mjs";

const suites = [
  { id: "unit", command: "pnpm", args: ["test:unit"] },
  { id: "integration", command: "pnpm", args: ["test:integration"] },
  { id: "security", command: "pnpm", args: ["test:security"] },
  { id: "e2e", command: "pnpm", args: ["test:e2e"] },
];

console.log("regresión: ejecutando suites del commit actual");
const results = runChecks(suites);
const failed = results.filter((result) => result.status !== "PASS");

mkdirSync(".gate", { recursive: true });
writeFileSync(
  ".gate/regression.json",
  `${JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2)}\n`,
  "utf8",
);

for (const result of results) {
  console.log(`${result.status.padEnd(4)} ${result.id} (${result.durationMs}ms)`);
  if (result.status !== "PASS") console.log(result.tail ?? result.reason ?? "");
}
console.log(failed.length === 0 ? "regresión: PASS" : `regresión: FAIL (${failed.length})`);
process.exit(failed.length === 0 ? 0 : 1);
