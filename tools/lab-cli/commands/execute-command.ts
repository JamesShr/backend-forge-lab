import type { LabDefinition } from "../manifest/lab-manifest.type";
import { resolveLifecycleCommand } from "../adapters/runtime-adapter";
import {
  formatDuration,
  printAvailableCommands,
  printFailure,
  printHeading,
  printKeyValues,
  printSuccess,
} from "../utils/console";
import { runCommand } from "../utils/command-runner";
import { resolveLabOrExit } from "../utils/lab-resolver";

export async function executeLabCommand(commandName: string, usage: string): Promise<void> {
  const lab = await resolveLabOrExit(process.argv[2], usage);

  if (!lab) {
    return;
  }

  await runLabCommand(lab, commandName);
}

async function runLabCommand(lab: LabDefinition, commandName: string): Promise<void> {
  const lifecycleCommand = resolveLifecycleCommand(lab, commandName);

  if (!lifecycleCommand) {
    printFailure(`Lab ${lab.id} 沒有設定 ${commandName} command。`);
    console.error("");
    printAvailableCommands(lab);
    process.exitCode = 1;
    return;
  }

  if (isDestructiveLifecycleCommand(commandName) && lab.manifest.cleanup?.destructive === true) {
    const confirmed = process.argv.includes("--yes");

    if (!confirmed) {
      printFailure(`Lab ${lab.id} 的 ${commandName} command 被標記為 destructive。`);
      console.error(`若確定要執行，請加上 --yes，例如：npm run lab:${commandName} -- ${lab.id} --yes`);
      process.exitCode = 1;
      return;
    }
  }

  printHeading(`Lab command: ${commandName}`);
  printKeyValues([
    { label: "Lab", value: lab.id },
    { label: "Runtime", value: lifecycleCommand.runtimeType },
    { label: "Source", value: lifecycleCommand.source },
    { label: "Command", value: lifecycleCommand.command },
  ]);
  console.log("");

  const result = await runCommand({
    command: lifecycleCommand.command,
    cwd: lifecycleCommand.cwd,
  });

  console.log("");
  printSuccess(`Command completed in ${formatDuration(result.durationMs)}.`);
}

function isDestructiveLifecycleCommand(commandName: string): boolean {
  return commandName === "reset" || commandName === "destroy";
}
