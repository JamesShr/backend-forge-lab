import { resetTopic, topics } from "./kafka-cli";

async function main(): Promise<void> {
  console.log("=== Reset: kafka-basic ===");
  console.log("");

  for (const topic of Object.values(topics)) {
    console.log(`Resetting topic: ${topic}`);
    await resetTopic(topic, 3);
  }

  console.log("");
  console.log("Reset complete.");
  console.log("  Topics: 3");
  console.log("  Partitions per topic: 3");
  console.log("  Replication factor: 1");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
