import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { getLabsRoot, normalizeLabId, toLabId } from "../utils/lab-path";
import type { LabDefinition, LabDomain, LabLevel, LabManifest, LabRuntimeType } from "./lab-manifest.type";

const labDomains: LabDomain[] = [
  "database",
  "distributed-systems",
  "messaging",
  "observability",
  "devops",
  "cloud",
  "kubernetes",
  "security",
  "ai",
];

const labLevels: LabLevel[] = ["L1", "L2", "L3", "L4"];
const runtimeTypes: LabRuntimeType[] = ["docker-compose", "kubernetes", "helm", "terraform", "script"];

export async function loadAllLabs(projectRoot = process.cwd()): Promise<LabDefinition[]> {
  const labsRoot = getLabsRoot(projectRoot);
  const manifestPaths = await findManifestPaths(labsRoot);
  const labs = await Promise.all(manifestPaths.map((manifestPath) => loadLabManifest(labsRoot, manifestPath)));

  return labs.sort((a, b) => a.id.localeCompare(b.id));
}

export async function findLabById(labId: string, projectRoot = process.cwd()): Promise<LabDefinition | undefined> {
  const normalizedLabId = normalizeLabId(labId);
  const labs = await loadAllLabs(projectRoot);

  return labs.find((lab) => lab.id === normalizedLabId);
}

async function findManifestPaths(directory: string): Promise<string[]> {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findManifestPaths(entryPath);
      }

      return entry.isFile() && entry.name === "lab.yaml" ? [entryPath] : [];
    }),
  );

  return nested.flat();
}

async function loadLabManifest(labsRoot: string, manifestPath: string): Promise<LabDefinition> {
  const raw = await fs.readFile(manifestPath, "utf8");
  const parsed = YAML.parse(raw) as unknown;
  const manifest = validateManifest(parsed, manifestPath);
  const directory = path.dirname(manifestPath);

  return {
    id: toLabId(labsRoot, directory),
    directory,
    manifestPath,
    manifest,
  };
}

function validateManifest(value: unknown, manifestPath: string): LabManifest {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: root value must be an object.`);
  }

  const name = requireString(value, "name", manifestPath);
  const domain = requireEnum(value, "domain", labDomains, manifestPath);
  const level = requireEnum(value, "level", labLevels, manifestPath);
  const description = requireString(value, "description", manifestPath);

  if ("runtime" in value && value.runtime !== undefined) {
    validateRuntime(value.runtime, manifestPath);
  }

  if ("roadmap" in value && value.roadmap !== undefined) {
    validateRoadmap(value.roadmap, manifestPath);
  }

  if ("commands" in value && value.commands !== undefined) {
    validateCommands(value.commands, manifestPath);
  }

  if ("experiments" in value && value.experiments !== undefined) {
    validateExperiments(value.experiments, manifestPath);
  }

  if ("cleanup" in value && value.cleanup !== undefined) {
    validateCleanup(value.cleanup, manifestPath);
  }

  const optionalManifestFields = value as unknown as Partial<LabManifest>;

  return {
    ...optionalManifestFields,
    name,
    domain,
    level,
    description,
  };
}

function validateRuntime(value: unknown, manifestPath: string): void {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: runtime must be an object.`);
  }

  requireEnum(value, "type", runtimeTypes, manifestPath);
}

function validateRoadmap(value: unknown, manifestPath: string): void {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: roadmap must be an object.`);
  }

  if ("targetLevel" in value && value.targetLevel !== undefined) {
    requireEnum(value, "targetLevel", labLevels, manifestPath);
  }
}

function validateCommands(value: unknown, manifestPath: string): void {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: commands must be an object.`);
  }

  for (const [commandName, command] of Object.entries(value)) {
    if (typeof command !== "string" || command.trim() === "") {
      throw new Error(
        `Invalid lab manifest at ${manifestPath}: commands.${commandName} must be a non-empty string.`,
      );
    }
  }
}

function validateExperiments(value: unknown, manifestPath: string): void {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: experiments must be an object.`);
  }

  for (const [experimentName, experiment] of Object.entries(value)) {
    if (!isRecord(experiment)) {
      throw new Error(
        `Invalid lab manifest at ${manifestPath}: experiments.${experimentName} must be an object.`,
      );
    }

    requireString(experiment, "command", manifestPath);

    if ("description" in experiment && experiment.description !== undefined && typeof experiment.description !== "string") {
      throw new Error(
        `Invalid lab manifest at ${manifestPath}: experiments.${experimentName}.description must be a string.`,
      );
    }
  }
}

function validateCleanup(value: unknown, manifestPath: string): void {
  if (!isRecord(value)) {
    throw new Error(`Invalid lab manifest at ${manifestPath}: cleanup must be an object.`);
  }

  if ("destructive" in value && value.destructive !== undefined && typeof value.destructive !== "boolean") {
    throw new Error(`Invalid lab manifest at ${manifestPath}: cleanup.destructive must be a boolean.`);
  }

  if ("command" in value && value.command !== undefined && typeof value.command !== "string") {
    throw new Error(`Invalid lab manifest at ${manifestPath}: cleanup.command must be a string.`);
  }
}

function requireString(record: Record<string, unknown>, key: string, manifestPath: string): string {
  const value = record[key];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid lab manifest at ${manifestPath}: ${key} must be a non-empty string.`);
  }

  return value;
}

function requireEnum<T extends string>(
  record: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  manifestPath: string,
): T {
  const value = requireString(record, key, manifestPath);

  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid lab manifest at ${manifestPath}: ${key} must be one of ${allowedValues.join(", ")}.`,
    );
  }

  return value as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function pathExists(value: string): Promise<boolean> {
  try {
    await fs.access(value);
    return true;
  } catch {
    return false;
  }
}
