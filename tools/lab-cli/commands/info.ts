import path from "node:path";
import { listLifecycleCommands } from "../adapters/runtime-adapter";
import { resolveLabOrExit } from "../utils/lab-resolver";
import {
  formatStatus,
  printHeading,
  printKeyValues,
  printList,
  printSection,
} from "../utils/console";

async function main(): Promise<void> {
  const lab = await resolveLabOrExit(
    process.argv[2],
    "請指定 lab id，例如：npm run lab:info -- database/transaction-isolation",
  );

  if (!lab) {
    return;
  }

  const { manifest } = lab;

  printHeading(`Lab: ${lab.id}`);
  printKeyValues([
    { label: "Name", value: manifest.name },
    { label: "Domain", value: manifest.domain },
    { label: "Level", value: manifest.level },
    { label: "Status", value: formatStatus(manifest.status) },
    { label: "Description", value: manifest.description },
    { label: "Directory", value: path.relative(process.cwd(), lab.directory) },
    { label: "Manifest", value: path.relative(process.cwd(), lab.manifestPath) },
  ]);

  if (manifest.skills?.length) {
    printSection("Skills");
    printList(manifest.skills);
  }

  if (manifest.roadmap) {
    printSection("Roadmap");
    printKeyValues([
      { label: "Importance", value: manifest.roadmap.importance },
      { label: "Target Level", value: manifest.roadmap.targetLevel },
    ]);
  }

  if (manifest.runtime) {
    printSection("Runtime");
    printKeyValues([
      { label: "Type", value: manifest.runtime.type },
      { label: "File", value: manifest.runtime.file },
    ]);
  }

  const lifecycleCommands = listLifecycleCommands(lab);

  if (lifecycleCommands.length > 0) {
    printSection("Commands");
    for (const lifecycleCommand of lifecycleCommands) {
      console.log(`- ${lifecycleCommand.name}: ${lifecycleCommand.command}`);
      console.log(`  source: ${lifecycleCommand.source}`);
    }
  }

  if (manifest.experiments && Object.keys(manifest.experiments).length > 0) {
    printSection("Experiments");
    for (const [name, experiment] of Object.entries(manifest.experiments)) {
      console.log(`- ${name}: ${experiment.command}`);
      if (experiment.description) {
        console.log(`  ${experiment.description}`);
      }
    }
  }

  if (manifest.cleanup) {
    printSection("Cleanup");
    printKeyValues([
      { label: "Destructive", value: manifest.cleanup.destructive === true ? "yes" : "no" },
      { label: "Command", value: manifest.cleanup.command },
    ]);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
