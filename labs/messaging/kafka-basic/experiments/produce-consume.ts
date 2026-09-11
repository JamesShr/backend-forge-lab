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
  console.log("=== Experiment: produce-consume ===");
  console.log("");
  console.log("Question:");
  console.log("  Can a producer append records to a Kafka topic and can a consumer read them back from the beginning?");

  const topic = topics.produceConsume;
  await resetTopic(topic, 3);

  const records = [
    { key: "order-1001", value: JSON.stringify({ event: "OrderCreated", orderId: "order-1001", amount: 4200 }) },
    { key: "order-1002", value: JSON.stringify({ event: "OrderCreated", orderId: "order-1002", amount: 7300 }) },
    { key: "order-1003", value: JSON.stringify({ event: "OrderCreated", orderId: "order-1003", amount: 12900 }) },
  ];

  printSection("Topic");
  console.log(await describeTopic(topic));

  printSection("Produce");
  await produceRecords(topic, records);
  console.log(`Produced ${records.length} order events.`);

  printSection("Consume from beginning");
  const consumed = await consumeRecords({
    topic,
    maxMessages: records.length,
    fromBeginning: true,
  });
  printLines(consumed);

  printSection("Observation");
  console.log("  Producer appended keyed records to the topic.");
  console.log("  Consumer read the same records from the beginning without requiring producer replay.");
  console.log("  This establishes the baseline before adding consumer groups, offset commits, and failure cases.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
