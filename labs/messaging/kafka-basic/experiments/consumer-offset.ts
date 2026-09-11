import {
  consumeRecords,
  describeConsumerGroup,
  printLines,
  printSection,
  produceRecords,
  resetTopic,
  sleep,
  topics,
} from "./kafka-cli";

async function main(): Promise<void> {
  console.log("=== Experiment: consumer-offset ===");
  console.log("");
  console.log("Question:");
  console.log("  How does a consumer group offset determine whether records are continued or replayed?");

  const topic = topics.consumerOffset;
  const runSuffix = Date.now().toString(36);
  const group = `lab-kafka-basic-orders-${runSuffix}`;
  const replayGroup = `lab-kafka-basic-replay-${runSuffix}`;
  await resetTopic(topic, 3);

  const records = [
    { key: "order-2001", value: JSON.stringify({ event: "OrderCreated", sequence: 1 }) },
    { key: "order-2002", value: JSON.stringify({ event: "OrderCreated", sequence: 2 }) },
    { key: "order-2003", value: JSON.stringify({ event: "OrderCreated", sequence: 3 }) },
    { key: "order-2004", value: JSON.stringify({ event: "OrderCreated", sequence: 4 }) },
  ];

  printSection("Produce");
  await produceRecords(topic, records);
  console.log(`Produced ${records.length} records.`);

  printSection("First consume with the same group, maxMessages=2");
  const firstBatch = await consumeRecords({
    topic,
    group,
    maxMessages: 2,
    fromBeginning: true,
  });
  printLines(firstBatch);
  await sleep(1500);
  console.log("");
  console.log(await describeConsumerGroup(group));

  printSection("Second consume with the same group, maxMessages=2");
  const secondBatch = await consumeRecords({
    topic,
    group,
    maxMessages: 2,
  });
  printLines(secondBatch);
  await sleep(1500);
  console.log("");
  console.log(await describeConsumerGroup(group));

  printSection("Replay with a new group from beginning");
  const replayBatch = await consumeRecords({
    topic,
    group: replayGroup,
    maxMessages: 4,
    fromBeginning: true,
  });
  printLines(replayBatch);
  await sleep(1500);
  console.log("");
  console.log(await describeConsumerGroup(replayGroup));

  printSection("Observation");
  console.log("  The original group continues from its committed offsets.");
  console.log("  A new group has independent offsets and can replay the same topic from the beginning.");
  console.log("  Offset state is part of delivery behavior, not just an implementation detail.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
