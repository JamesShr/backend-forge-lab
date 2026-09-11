import {
  describeTopic,
  listConsumerGroups,
  listTopics,
  printLines,
  printSection,
  topics,
} from "./kafka-cli";

async function main(): Promise<void> {
  console.log("=== Observe: kafka-basic ===");

  printSection("Topics");
  const currentTopics = await listTopics();
  printLines(currentTopics.filter((topic) => topic.startsWith("lab.kafka-basic.")));

  printSection("Topic details");
  for (const topic of Object.values(topics)) {
    console.log(await describeTopic(topic));
    console.log("");
  }

  printSection("Consumer groups");
  const groups = await listConsumerGroups();
  printLines(groups.filter((group) => group.startsWith("lab-kafka-basic-")));

  printSection("Observation guide");
  console.log("  Topic partitions are the storage, ordering, and parallelism boundary.");
  console.log("  Consumer groups track progress by committed offsets.");
  console.log("  A new group can replay existing records from the beginning.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
