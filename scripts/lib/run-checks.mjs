import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export function runCheck({ id, command, args, env = {}, logDir = ".gate/logs" }) {
  const started = Date.now();
  mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `${id}.log`);
  let result;
  try {
    result = spawnSync(command, args, {
      encoding: "utf8",
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const durationMs = Date.now() - started;
    const message = `spawn error: ${error && error.message ? error.message : String(error)}`;
    writeFileSync(logPath, message, "utf8");
    return { id, status: "FAIL", reason: message, exitCode: null, durationMs, logPath };
  }
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const durationMs = Date.now() - started;
  writeFileSync(
    logPath,
    `$ ${command} ${args.join(" ")}\nexit=${result.status}\ndurationMs=${durationMs}\n\n${output}`,
    "utf8",
  );
  if (result.error) {
    return {
      id,
      status: "FAIL",
      reason: `command not found or not runnable: ${result.error.message}`,
      exitCode: null,
      durationMs,
      logPath,
    };
  }
  if (result.status !== 0) {
    return {
      id,
      status: "FAIL",
      exitCode: result.status,
      signal: result.signal ?? null,
      durationMs,
      logPath,
      tail: output.split(/\r?\n/).slice(-40).join("\n"),
    };
  }
  return { id, status: "PASS", exitCode: 0, durationMs, logPath, tail: "" };
}

export function runChecks(checks, options = {}) {
  return checks.map((check) => runCheck({ ...options, ...check }));
}
