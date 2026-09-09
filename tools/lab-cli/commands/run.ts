import { printAvailableExperiments } from "../utils/console";
import {
  CommandExecutionError,
  runCommand,
} from "../utils/command-runner";
import { resolveLabOrExit } from "../utils/lab-resolver";
import {
  completeRunArtifact,
  createRunArtifact,
  failRunArtifact,
} from "../run-artifacts/run-artifact";
import {
  formatDuration,
  printFailure,
  printHeading,
  printKeyValues,
  printSuccess,
} from "../utils/console";

async function main(): Promise<void> {
  const lab = await resolveLabOrExit(
    process.argv[2],
    "請指定 lab id 與 experiment，例如：npm run lab:run -- database/transaction-isolation non-repeatable-read",
  );

  if (!lab) {
    return;
  }

  const experimentName = process.argv[3];

  if (!experimentName) {
    printFailure("請指定 experiment name。");
    console.error("");
    printAvailableExperiments(lab);
    process.exitCode = 1;
    return;
  }

  const experiment = lab.manifest.experiments?.[experimentName];

  if (!experiment) {
    printFailure(`Lab ${lab.id} 沒有設定 experiment：${experimentName}`);
    console.error("");
    printAvailableExperiments(lab);
    process.exitCode = 1;
    return;
  }

  const artifact = await createRunArtifact({
    lab,
    experimentName,
    experimentDescription: experiment.description,
    command: experiment.command,
  });

  printHeading(`Experiment: ${experimentName}`);
  printKeyValues([
    { label: "Lab", value: lab.id },
    { label: "Command", value: experiment.command },
    { label: "Run artifact", value: artifact.directory },
  ]);
  console.log("");

  try {
    const result = await runCommand({
      command: experiment.command,
      cwd: lab.directory,
      logPath: artifact.outputLogPath,
    });

    await completeRunArtifact(artifact, result);
    console.log("");
    printSuccess(`Experiment completed in ${formatDuration(result.durationMs)}.`);
    printKeyValues([
      { label: "Run metadata", value: artifact.metadataPath },
      { label: "Run output", value: artifact.outputLogPath },
    ]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const result = error instanceof CommandExecutionError ? error.result : undefined;

    await failRunArtifact(artifact, { result, errorMessage });
    console.error("");
    printFailure(errorMessage);
    printKeyValues(
      [
        { label: "Run metadata", value: artifact.metadataPath },
        { label: "Run output", value: artifact.outputLogPath },
      ],
      "stderr",
    );
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
