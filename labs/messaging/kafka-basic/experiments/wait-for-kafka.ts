import { waitForKafka } from "./kafka-cli";

async function main(): Promise<void> {
  await waitForKafka();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
