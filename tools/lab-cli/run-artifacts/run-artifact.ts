import { promises as fs } from "node:fs";
import path from "node:path";
import type { LabDefinition } from "../manifest/lab-manifest.type";
import type { RunCommandResult } from "../utils/command-runner";

export type RunArtifactStatus = "running" | "success" | "failed";

export interface RunArtifactMetadata {
  schemaVersion: 1;
  runId: string;
  labId: string;
  labName: string;
  domain: string;
  level: string;
  experimentName: string;
  experimentDescription?: string;
  command: string;
  cwd: string;
  status: RunArtifactStatus;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  signal: string | null;
  errorMessage?: string;
}

export interface RunArtifact {
  runId: string;
  directory: string;
  metadataPath: string;
  outputLogPath: string;
  metadata: RunArtifactMetadata;
}

export interface PersistedRunArtifact extends RunArtifact {
  outputLog: string;
}

export async function createRunArtifact(options: {
  lab: LabDefinition;
  experimentName: string;
  command: string;
  experimentDescription?: string;
}): Promise<RunArtifact> {
  const runId = createRunId(options.experimentName);
  const directory = path.join(options.lab.directory, "runs", runId);
  const metadataPath = path.join(directory, "metadata.json");
  const outputLogPath = path.join(directory, "output.log");

  await fs.mkdir(directory, { recursive: true });

  const metadata: RunArtifactMetadata = {
    schemaVersion: 1,
    runId,
    labId: options.lab.id,
    labName: options.lab.manifest.name,
    domain: options.lab.manifest.domain,
    level: options.lab.manifest.level,
    experimentName: options.experimentName,
    experimentDescription: options.experimentDescription,
    command: options.command,
    cwd: options.lab.directory,
    status: "running",
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMs: null,
    exitCode: null,
    signal: null,
  };

  await writeRunMetadata(metadataPath, metadata);

  return {
    runId,
    directory,
    metadataPath,
    outputLogPath,
    metadata,
  };
}

export async function completeRunArtifact(
  artifact: RunArtifact,
  result: RunCommandResult,
): Promise<void> {
  await writeRunMetadata(artifact.metadataPath, {
    ...artifact.metadata,
    status: "success",
    startedAt: result.startedAt,
    endedAt: result.endedAt,
    durationMs: result.durationMs,
    exitCode: result.exitCode,
    signal: result.signal,
  });
}

export async function failRunArtifact(
  artifact: RunArtifact,
  options: { result?: RunCommandResult; errorMessage: string },
): Promise<void> {
  await writeRunMetadata(artifact.metadataPath, {
    ...artifact.metadata,
    status: "failed",
    startedAt: options.result?.startedAt ?? artifact.metadata.startedAt,
    endedAt: options.result?.endedAt ?? new Date().toISOString(),
    durationMs: options.result?.durationMs ?? null,
    exitCode: options.result?.exitCode ?? null,
    signal: options.result?.signal ?? null,
    errorMessage: options.errorMessage,
  });
}

export async function loadRunArtifacts(lab: LabDefinition): Promise<PersistedRunArtifact[]> {
  const runsRoot = path.join(lab.directory, "runs");

  if (!(await pathExists(runsRoot))) {
    return [];
  }

  const entries = await fs.readdir(runsRoot, { withFileTypes: true });
  const artifacts = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const directory = path.join(runsRoot, entry.name);
        const metadataPath = path.join(directory, "metadata.json");
        const outputLogPath = path.join(directory, "output.log");

        if (!(await pathExists(metadataPath))) {
          return undefined;
        }

        const metadata = parseRunMetadata(await fs.readFile(metadataPath, "utf8"), metadataPath);
        const outputLog = (await pathExists(outputLogPath)) ? await fs.readFile(outputLogPath, "utf8") : "";

        return {
          runId: metadata.runId,
          directory,
          metadataPath,
          outputLogPath,
          metadata,
          outputLog,
        };
      }),
  );

  return artifacts
    .filter((artifact): artifact is PersistedRunArtifact => artifact !== undefined)
    .sort((a, b) => b.metadata.startedAt.localeCompare(a.metadata.startedAt));
}

function createRunId(experimentName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(".", "-");
  const suffix = experimentName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return `${timestamp}-${suffix}`;
}

async function writeRunMetadata(metadataPath: string, metadata: RunArtifactMetadata): Promise<void> {
  await fs.writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
}

function parseRunMetadata(raw: string, metadataPath: string): RunArtifactMetadata {
  const parsed = JSON.parse(raw) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(`Invalid run metadata at ${metadataPath}: root value must be an object.`);
  }

  return {
    schemaVersion: requireNumber(parsed, "schemaVersion", metadataPath) as 1,
    runId: requireString(parsed, "runId", metadataPath),
    labId: requireString(parsed, "labId", metadataPath),
    labName: requireString(parsed, "labName", metadataPath),
    domain: requireString(parsed, "domain", metadataPath),
    level: requireString(parsed, "level", metadataPath),
    experimentName: requireString(parsed, "experimentName", metadataPath),
    experimentDescription: optionalString(parsed, "experimentDescription", metadataPath),
    command: requireString(parsed, "command", metadataPath),
    cwd: requireString(parsed, "cwd", metadataPath),
    status: requireStatus(parsed, "status", metadataPath),
    startedAt: requireString(parsed, "startedAt", metadataPath),
    endedAt: nullableString(parsed, "endedAt", metadataPath),
    durationMs: optionalNumber(parsed, "durationMs", metadataPath),
    exitCode: optionalNumber(parsed, "exitCode", metadataPath),
    signal: nullableString(parsed, "signal", metadataPath),
    errorMessage: optionalString(parsed, "errorMessage", metadataPath),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(record: Record<string, unknown>, key: string, metadataPath: string): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be a non-empty string.`);
  }

  return value;
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  metadataPath: string,
): string | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be a string.`);
  }

  return value;
}

function nullableString(record: Record<string, unknown>, key: string, metadataPath: string): string | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be a string or null.`);
  }

  return value;
}

function requireNumber(record: Record<string, unknown>, key: string, metadataPath: string): number {
  const value = record[key];

  if (typeof value !== "number") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be a number.`);
  }

  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string, metadataPath: string): number | null {
  const value = record[key];

  if (value === null) {
    return null;
  }

  if (typeof value !== "number") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be a number or null.`);
  }

  return value;
}

function requireStatus(
  record: Record<string, unknown>,
  key: string,
  metadataPath: string,
): RunArtifactStatus {
  const value = requireString(record, key, metadataPath);

  if (value !== "running" && value !== "success" && value !== "failed") {
    throw new Error(`Invalid run metadata at ${metadataPath}: ${key} must be running, success, or failed.`);
  }

  return value;
}

async function pathExists(value: string): Promise<boolean> {
  try {
    await fs.access(value);
    return true;
  } catch {
    return false;
  }
}
