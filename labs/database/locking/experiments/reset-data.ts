import { resetWorkItems } from "./db";

async function main(): Promise<void> {
  await resetWorkItems();
  console.log("Work queue reset: task-1, task-2, task-3 are pending");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
