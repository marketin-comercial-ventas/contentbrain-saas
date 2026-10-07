import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  decideFinalStatus,
  formatCanonicalReport,
} from "./lib/gate-decision.mjs";
import { runCheck } from "./lib/run-checks.mjs";

function parseArgs(argv) {
  const options = {
    module: null,
    selftest: false,
    allowPendingQa: false,
    supervisor: "PENDING",
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--module") {
      options.module = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === "--selftest") {
      options.selftest = true;
    } else if (arg === "--allow-pending-qa") {
      options.allowPendingQa = true;
    } else if (arg === "--supervisor") {
      options.supervisor = (argv[i + 1] ?? "PENDING").toUpperCase();
      i += 1;
    } else {
      console.error(`argumento desconocido: ${arg}`);
      process.exit(64);
    }
  }
  return options;
}

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8", shell: process.platform === "win32" });
  if (result.status !== 0) return null;
  return (result.stdout ?? "").trim();
}

function readJsonIfExists(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8"));
}

const options = parseArgs(process.argv.slice(2));
const moduleLabel = options.module ? options.module.toUpperCase() : "ADHOC";

const commitShort = git(["rev-parse", "--short", "HEAD"]) ?? "nogit";
const dirty = (git(["status", "--porcelain"]) ?? "").length > 0;
const codeCommit = dirty ? `${commitShort}-dirty` : commitShort;
const pnpmVersion = (
  spawnSync("pnpm", ["--version"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  }).stdout ?? "desconocida"
).trim();

const environment = [
  `platform=${process.platform}`,
  `node=${process.version}`,
  `pnpm=${pnpmVersion}`,
  `embedded-postgres=17.10.0-beta.17`,
].join(" ");

const checksPlan = [
  { id: "lint", command: "pnpm", args: ["lint"] },
  { id: "typecheck", command: "pnpm", args: ["typecheck"] },
  { id: "unit", command: "pnpm", args: ["test:unit"] },
  { id: "build", command: "pnpm", args: ["build"] },
  { id: "integration", command: "pnpm", args: ["test:integration"] },
  { id: "security", command: "pnpm", args: ["test:security"] },
  { id: "e2e", command: "pnpm", args: ["test:e2e"] },
];

console.log(`quality:gate module=${moduleLabel} commit=${codeCommit} selftest=${options.selftest}`);
const checkEnv = options.selftest ? { GATE_SELFTEST: "1" } : {};
const checks = checksPlan.map((plan) => runCheck({ ...plan, env: checkEnv }));

const byId = Object.fromEntries(checks.map((check) => [check.id, check]));
const automated = {
  lint: byId.lint.status,
  typecheck: byId.typecheck.status,
  unitTests: byId.unit.status,
  integrationTests: byId.integration.status,
  security: byId.security.status,
  e2e: byId.e2e.status,
  productionBuild: byId.build.status,
};
const regression = ["unit", "integration", "security", "e2e"].every(
  (id) => byId[id].status === "PASS",
);

const applicabilityPath = options.module
  ? path.join("docs", "modules", `${options.module}.applicability.json`)
  : null;
const applicability = applicabilityPath ? (readJsonIfExists(applicabilityPath) ?? {}) : {};
if (!applicabilityPath || !existsSync(applicabilityPath)) {
  console.warn(
    `aplicabilidad: ${applicabilityPath ?? "(sin módulo)"} ausente → campos aplicables quedarán BLOCKED`,
  );
}

const evidenceDir = options.module
  ? path.join("docs", "qa", options.module, codeCommit)
  : path.join(".gate", "adhoc");
const qaVerdict = readJsonIfExists(path.join(evidenceDir, "qa-verdict.json"));

const decision = decideFinalStatus({
  automated,
  applicability,
  regression,
  qaVerdict,
  supervisorDecision: options.supervisor,
  codeCommit,
});

const failedChecks = checks.filter((check) => check.status !== "PASS");
const applicabilityDecisions = Object.entries(applicability)
  .map(([field, entry]) => `${field}=${entry.status ?? "SIN-ESTADO"}`)
  .join("; ");
const findings =
  failedChecks.length > 0
    ? failedChecks.map((check) => `${check.id}: ver ${check.id}.log`).join("; ")
    : "ninguno en esta ejecución";

const report = {
  module: moduleLabel,
  scope: options.module
    ? `docs/modules/${options.module}.md (criterios de aceptación del contrato)`
    : "ejecución adhoc sin contrato de módulo",
  codeCommit,
  environment,
  evidencePaths: `${evidenceDir}/ (report.json, report.md, logs por comprobación) | CI: ${
    existsSync(".github/workflows/ci.yml") ? "workflow local definido; sin remoto configurado" : "sin workflow"
  }`,
  fields: decision.fields,
  applicabilityDecisions: applicabilityDecisions || "ninguna registrada",
  skipped: "ninguna (todas las comprobaciones ejecutadas)" ,
  findings,
  qaReviewer: qaVerdict ? qaVerdict.reviewer : "PENDIENTE (sin revisor independiente)",
  qaDecision: decision.qaDecision,
  supervisorDecision: decision.supervisorDecision,
  gateExecution: "COMPLETE",
  finalStatus: decision.finalStatus,
  nextModuleAllowed: decision.nextModuleAllowed,
  reasons: decision.reasons,
  checks: checks.map((check) => ({
    id: check.id,
    status: check.status,
    exitCode: check.exitCode ?? null,
    durationMs: check.durationMs,
    log: check.logPath,
  })),
  options: {
    selftest: options.selftest,
    allowPendingQa: options.allowPendingQa,
  },
  generatedAt: new Date().toISOString(),
};

mkdirSync(evidenceDir, { recursive: true });
for (const check of checks) {
  copyFileSync(check.logPath, path.join(evidenceDir, `${check.id}.log`));
}
writeFileSync(path.join(evidenceDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
const canonical = formatCanonicalReport(report);
writeFileSync(path.join(evidenceDir, "report.md"), canonical, "utf8");
console.log(`evidencia: ${evidenceDir}`);
console.log("");
console.log(canonical);

if (report.finalStatus === "APPROVED") process.exit(0);
if (report.finalStatus === "REJECTED") process.exit(1);
if (options.allowPendingQa && failedChecks.length === 0) {
  console.log(
    "modo CI (--allow-pending-qa): comprobaciones automáticas PASS; cierre QA/Supervisor sigue PENDIENTE (no es aprobación)",
  );
  process.exit(0);
}
process.exit(2);
