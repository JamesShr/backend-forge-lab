import {
  consumeRecords,
  describeTopic,
  printLines,
  printSection,
  produceRecords,
  resetTopic,
  topics,
} from "./kafka-cli";

async function main(): Promise<void> {
  console.log("=== Experiment: partitioning ===");
  console.log("");
  console.log("Question:");
  console.log("  How does a record key affect partition placement and the ordering boundary?");

  const topic = topics.partitioning;
  await resetTopic(topic, 3);

  const records = [
    { key: "customer-a", value: JSON.stringify({ event: "OrderCreated", orderId: "a-1" }) },
    { key: "customer-b", value: JSON.stringify({ event: "OrderCreated", orderId: "b-1" }) },
    { key: "customer-a", value: JSON.stringify({ event: "PaymentAuthorized", orderId: "a-1" }) },
    { key: "customer-c", value: JSON.stringify({ event: "OrderCreated", orderId: "c-1" }) },
    { key: "customer-b", value: JSON.stringify({ event: "PaymentAuthorized", orderId: "b-1" }) },
  ];

  printSection("Topic");
  console.log(await describeTopic(topic));

  printSection("Produce keyed records");
  await produceRecords(topic, records);
  console.log(`Produced ${records.length} records with customer keys.`);

  printSection("Consume with partition and offset metadata");
  const consumed = await consumeRecords({
    topic,
    maxMessages: records.length,
    fromBeginning: true,
    includeMetadata: true,
  });
  printLines(consumed);

  printSection("Observation");
  console.log("  Records with the same key should stay on the same partition.");
  console.log("  Ordering is only guaranteed within a partition, not across the whole topic.");
  console.log("  A hot key can create a hot partition even when the topic has multiple partitions.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
