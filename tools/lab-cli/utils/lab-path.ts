import path from "node:path";

export function getProjectRoot(): string {
  return process.cwd();
}

export function getLabsRoot(projectRoot = getProjectRoot()): string {
  return path.join(projectRoot, "labs");
}

export function toLabId(labsRoot: string, labDirectory: string): string {
  return path.relative(labsRoot, labDirectory).split(path.sep).join("/");
}

export function normalizeLabId(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}
