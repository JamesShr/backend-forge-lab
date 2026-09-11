import { spawn } from "node:child_process";

export const topics = {
  produceConsume: "lab.kafka-basic.produce-consume",
  partitioning: "lab.kafka-basic.partitioning",
  consumerOffset: "lab.kafka-basic.consumer-offset",
};

const kafkaBin = "/opt/kafka/bin";
const bootstrapServer = "localhost:9092";

export interface CommandResult {
  stdout: string;
  stderr: string;
}

export interface RecordInput {
  key: string;
  value: string;
}

export async function waitForKafka(options?: { attempts?: number; delayMs?: number }): Promise<void> {
  const attempts = options?.attempts ?? 30;
  const delayMs = options?.delayMs ?? 2000;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await runKafkaCli(["kafka-topics.sh", "--list"], { allowFailure: true });

    if (result.ok) {
      console.log(`Kafka is ready after ${attempt} attempt(s).`);
      return;
    }

    console.log(`Waiting for Kafka... attempt ${attempt}/${attempts}`);
    await sleep(delayMs);
  }

  throw new Error(`Kafka did not become ready after ${attempts} attempts.`);
}

export async function resetTopic(topic: string, partitions = 3): Promise<void> {
  await runKafkaCli(["kafka-topics.sh", "--delete", "--topic", topic], { allowFailure: true });
  await waitForTopicDeletion(topic);
  await runKafkaCli([
    "kafka-topics.sh",
    "--create",
    "--if-not-exists",
    "--topic",
    topic,
    "--partitions",
    String(partitions),
    "--replication-factor",
    "1",
  ]);
}

export async function describeTopic(topic: string): Promise<string> {
  const result = await runKafkaCli(["kafka-topics.sh", "--describe", "--topic", topic]);
  return result.stdout.trim();
}

export async function listTopics(): Promise<string[]> {
  const result = await runKafkaCli(["kafka-topics.sh", "--list"]);
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .sort();
}

export async function listConsumerGroups(): Promise<string[]> {
  const result = await runKafkaCli(["kafka-consumer-groups.sh", "--list"], { allowFailure: true });

  if (!result.ok) {
    return [];
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .sort();
}

export async function produceRecords(topic: string, records: RecordInput[]): Promise<void> {
  const input = records.map((record) => `${record.key}:${record.value}`).join("\n") + "\n";

  await runKafkaCli(
    [
      "kafka-console-producer.sh",
      "--topic",
      topic,
      "--property",
      "parse.key=true",
      "--property",
      "key.separator=:",
    ],
    { input },
  );
}

export async function consumeRecords(options: {
  topic: string;
  maxMessages: number;
  group?: string;
  fromBeginning?: boolean;
  timeoutMs?: number;
  includeMetadata?: boolean;
}): Promise<string[]> {
  const args = [
    "kafka-console-consumer.sh",
    "--topic",
    options.topic,
    "--max-messages",
    String(options.maxMessages),
    "--timeout-ms",
    String(options.timeoutMs ?? 5000),
    "--formatter",
    "kafka.tools.DefaultMessageFormatter",
    "--property",
    "print.key=true",
    "--property",
    "key.separator=:",
  ];

  if (options.includeMetadata) {
    args.push("--property", "print.partition=true", "--property", "print.offset=true");
  }

  if (options.group) {
    args.push("--group", options.group);
  }

  if (options.fromBeginning) {
    args.push("--from-beginning");
  }

  const result = await runKafkaCli(args);

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("Processed a total of"));
}

export async function describeConsumerGroup(group: string): Promise<string> {
  const result = await runKafkaCli(["kafka-consumer-groups.sh", "--describe", "--group", group], {
    allowFailure: true,
  });

  if (!result.ok) {
    return result.stderr.trim() || result.stdout.trim() || "(consumer group has no committed offsets yet)";
  }

  return result.stdout.trim();
}

export function printSection(title: string): void {
  console.log("");
  console.log(`-- ${title} --`);
}

export function printLines(lines: string[]): void {
  if (lines.length === 0) {
    console.log("  (none)");
    return;
  }

  for (const line of lines) {
    console.log(`  ${line}`);
  }
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForTopicDeletion(topic: string): Promise<void> {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    const currentTopics = await listTopics();

    if (!currentTopics.includes(topic)) {
      return;
    }

    await sleep(500);
  }
}

async function runKafkaCli(
  kafkaArgs: string[],
  options?: { input?: string; allowFailure?: false },
): Promise<CommandResult>;
async function runKafkaCli(
  kafkaArgs: string[],
  options: { input?: string; allowFailure: true },
): Promise<CommandResult & { ok: boolean }>;
async function runKafkaCli(
  kafkaArgs: string[],
  options?: { input?: string; allowFailure?: boolean },
): Promise<CommandResult | (CommandResult & { ok: boolean })> {
  const [script, ...scriptArgs] = kafkaArgs;

  if (!script) {
    throw new Error("Kafka CLI script is required.");
  }

  const dockerArgs = [
    "compose",
    "exec",
    "-T",
    "kafka",
    `${kafkaBin}/${script}`,
    "--bootstrap-server",
    bootstrapServer,
    ...scriptArgs,
  ];

  const result = await runCommand("docker", dockerArgs, options?.input);
  const ok = result.exitCode === 0;

  if (!ok && !options?.allowFailure) {
    throw new Error(
      [
        `Kafka CLI command failed: ${script} ${scriptArgs.join(" ")}`,
        result.stderr.trim(),
        result.stdout.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (options?.allowFailure) {
    return { stdout: result.stdout, stderr: result.stderr, ok };
  }

  return { stdout: result.stdout, stderr: result.stderr };
}

function runCommand(command: string, args: string[], input?: string): Promise<CommandResult & { exitCode: number | null }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ stdout, stderr, exitCode }));

    if (input) {
      child.stdin.write(input);
    }

    child.stdin.end();
  });
}
