import type { LabDefinition } from "../manifest/lab-manifest.type";
import { listLifecycleCommands } from "../adapters/runtime-adapter";

export type OutputStream = "stdout" | "stderr";

export interface KeyValueRow {
  label: string;
  value: string | number | null | undefined;
}

export function printHeading(title: string, stream: OutputStream = "stdout"): void {
  writeLine(stream, `== ${title} ==`);
}

export function printSection(title: string, stream: OutputStream = "stdout"): void {
  writeLine(stream, "");
  writeLine(stream, `-- ${title} --`);
}

export function printKeyValues(rows: KeyValueRow[], stream: OutputStream = "stdout"): void {
  const visibleRows = rows.filter((row) => row.value !== undefined);
  const labelWidth = Math.max(...visibleRows.map((row) => row.label.length), 0);

  for (const row of visibleRows) {
    writeLine(stream, `${row.label.padEnd(labelWidth)} : ${formatValue(row.value)}`);
  }
}

export function printList(items: string[], stream: OutputStream = "stdout"): void {
  for (const item of items) {
    writeLine(stream, `- ${item}`);
  }
}

export function printSuccess(message: string): void {
  console.log(`[ok] ${message}`);
}

export function printFailure(message: string): void {
  console.error(`[failed] ${message}`);
}

export function formatDuration(durationMs: number | null | undefined): string {
  if (durationMs === null || durationMs === undefined) {
    return "n/a";
  }

  if (durationMs < 1_000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1_000).toFixed(2)}s`;
}

export function formatStatus(value: string | undefined): string {
  return value ?? "unknown";
}

export function printAvailableLabs(labs: LabDefinition[]): void {
  if (labs.length === 0) {
    printFailure("目前沒有可用 labs。請先在 labs/<domain>/<scenario>/ 建立 lab.yaml。");
    return;
  }

  printHeading("Available labs", "stderr");
  for (const lab of labs) {
    console.error(`- ${lab.id}`);
  }
}

export function printAvailableCommands(lab: LabDefinition): void {
  const commandNames = listLifecycleCommands(lab).map((command) => command.name);

  if (commandNames.length === 0) {
    printFailure(`Lab ${lab.id} 目前沒有設定 lifecycle commands。`);
    return;
  }

  printHeading(`Available commands for ${lab.id}`, "stderr");
  printList(commandNames, "stderr");
}

export function printAvailableExperiments(lab: LabDefinition): void {
  const experimentNames = Object.keys(lab.manifest.experiments ?? {});

  if (experimentNames.length === 0) {
    printFailure(`Lab ${lab.id} 目前沒有設定 experiments。`);
    return;
  }

  printHeading(`Available experiments for ${lab.id}`, "stderr");
  printList(experimentNames, "stderr");
}

function writeLine(stream: OutputStream, message: string): void {
  if (stream === "stderr") {
    console.error(message);
    return;
  }

  console.log(message);
}

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "n/a";
  }

  return String(value);
}
