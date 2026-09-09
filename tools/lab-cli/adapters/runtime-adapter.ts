import type { LabDefinition, LabRuntimeType } from "../manifest/lab-manifest.type";

export interface ResolvedLifecycleCommand {
  name: string;
  command: string;
  cwd: string;
  source: "manifest" | "runtime-adapter" | "cleanup";
  runtimeType?: LabRuntimeType;
}

interface LabRuntimeAdapter {
  type: LabRuntimeType;
  getDefaultCommands(lab: LabDefinition): Record<string, string>;
}

const lifecycleCommandOrder = [
  "prepare",
  "up",
  "down",
  "reset",
  "status",
  "logs",
  "observe",
  "destroy",
];

const dockerComposeAdapter: LabRuntimeAdapter = {
  type: "docker-compose",
  getDefaultCommands(lab) {
    return {
      prepare: dockerComposeCommand(lab, "config --quiet"),
      up: dockerComposeCommand(lab, "up -d"),
      down: dockerComposeCommand(lab, "down"),
      reset: dockerComposeCommand(lab, "down -v"),
      status: dockerComposeCommand(lab, "ps"),
      logs: dockerComposeCommand(lab, "logs"),
      destroy: lab.manifest.cleanup?.command ?? dockerComposeCommand(lab, "down -v"),
    };
  },
};

const emptyAdapters: Record<Exclude<LabRuntimeType, "docker-compose">, LabRuntimeAdapter> = {
  kubernetes: {
    type: "kubernetes",
    getDefaultCommands: () => ({}),
  },
  helm: {
    type: "helm",
    getDefaultCommands: () => ({}),
  },
  terraform: {
    type: "terraform",
    getDefaultCommands: () => ({}),
  },
  script: {
    type: "script",
    getDefaultCommands: () => ({}),
  },
};

export function resolveLifecycleCommand(
  lab: LabDefinition,
  commandName: string,
): ResolvedLifecycleCommand | undefined {
  const manifestCommand = lab.manifest.commands?.[commandName];

  if (manifestCommand) {
    return {
      name: commandName,
      command: manifestCommand,
      cwd: lab.directory,
      source: "manifest",
      runtimeType: lab.manifest.runtime?.type,
    };
  }

  const adapter = getRuntimeAdapter(lab);
  const adapterCommand = adapter?.getDefaultCommands(lab)[commandName];

  if (adapterCommand) {
    return {
      name: commandName,
      command: adapterCommand,
      cwd: lab.directory,
      source: commandName === "destroy" && lab.manifest.cleanup?.command ? "cleanup" : "runtime-adapter",
      runtimeType: adapter.type,
    };
  }

  return undefined;
}

export function listLifecycleCommands(lab: LabDefinition): ResolvedLifecycleCommand[] {
  const adapter = getRuntimeAdapter(lab);
  const defaultCommands = adapter?.getDefaultCommands(lab) ?? {};
  const commandNames = new Set([...Object.keys(defaultCommands), ...Object.keys(lab.manifest.commands ?? {})]);

  return [...commandNames]
    .sort(compareLifecycleCommandNames)
    .map((commandName) => resolveLifecycleCommand(lab, commandName))
    .filter((command): command is ResolvedLifecycleCommand => command !== undefined);
}

function getRuntimeAdapter(lab: LabDefinition): LabRuntimeAdapter | undefined {
  const runtimeType = lab.manifest.runtime?.type;

  if (!runtimeType) {
    return undefined;
  }

  if (runtimeType === "docker-compose") {
    return dockerComposeAdapter;
  }

  return emptyAdapters[runtimeType];
}

function dockerComposeCommand(lab: LabDefinition, command: string): string {
  const file = lab.manifest.runtime?.file;

  if (!file) {
    return `docker compose ${command}`;
  }

  return `docker compose -f ${quoteShellArgument(file)} ${command}`;
}

function quoteShellArgument(value: string): string {
  if (/^[A-Za-z0-9._/-]+$/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

function compareLifecycleCommandNames(a: string, b: string): number {
  const indexA = lifecycleCommandOrder.indexOf(a);
  const indexB = lifecycleCommandOrder.indexOf(b);

  if (indexA === -1 && indexB === -1) {
    return a.localeCompare(b);
  }

  if (indexA === -1) {
    return 1;
  }

  if (indexB === -1) {
    return -1;
  }

  return indexA - indexB;
}
