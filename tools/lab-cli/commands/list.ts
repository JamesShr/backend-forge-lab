import { loadAllLabs } from "../manifest/lab-manifest.loader";
import { formatStatus, printHeading } from "../utils/console";

async function main(): Promise<void> {
  const labs = await loadAllLabs();

  if (labs.length === 0) {
    console.log("目前沒有可用 labs。請先在 labs/<domain>/<scenario>/ 建立 lab.yaml。");
    return;
  }

  printHeading("Labs");
  console.log(`Found ${labs.length} lab(s).`);
  console.log("");

  const idWidth = Math.max(...labs.map((lab) => lab.id.length), "Lab".length);
  const levelWidth = "Level".length;
  const statusWidth = Math.max(...labs.map((lab) => formatStatus(lab.manifest.status).length), "Status".length);
  const domainWidth = Math.max(...labs.map((lab) => lab.manifest.domain.length), "Domain".length);

  console.log(
    `${"Lab".padEnd(idWidth)}  ${"Level".padEnd(levelWidth)}  ${"Status".padEnd(statusWidth)}  ${"Domain".padEnd(domainWidth)}  Description`,
  );
  console.log(
    `${"-".repeat(idWidth)}  ${"-".repeat(levelWidth)}  ${"-".repeat(statusWidth)}  ${"-".repeat(domainWidth)}  ${"-".repeat("Description".length)}`,
  );

  for (const lab of labs) {
    const { manifest } = lab;
    console.log(
      `${lab.id.padEnd(idWidth)}  ${manifest.level.padEnd(levelWidth)}  ${formatStatus(manifest.status).padEnd(statusWidth)}  ${manifest.domain.padEnd(domainWidth)}  ${manifest.description}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
