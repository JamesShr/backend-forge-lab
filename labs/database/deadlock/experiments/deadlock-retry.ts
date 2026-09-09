import { createClient, readAccounts, resetAccounts, safeRollback, sleep, updateAccountBalance } from "./db";
import { formatPgError, isDeadlockDetected } from "./errors";

interface TransferResult {
  name: string;
  status: "committed";
  attempts: number;
}

const maxAttempts = 5;
const transferDelayMs = 250;
const retryDelayMs = 100;

async function main(): Promise<void> {
  await resetAccounts();

  console.log("Scenario: retry the whole transfer after a deadlock abort.");
  console.log("");
  console.log("Initial balances: alpha = 100, beta = 100");

  const results = await Promise.all([
    transferWithRetry("T1", "alpha", "beta", 10),
    transferWithRetry("T2", "beta", "alpha", 20),
  ]);
  const accounts = await readFinalAccounts();
  const totalAttempts = results.reduce((sum, result) => sum + result.attempts, 0);

  console.log("");
  console.log("Transfer results:");
  console.table(results);
  console.log(`Total attempts: ${totalAttempts}`);
  console.log(`Retried attempts: ${totalAttempts - results.length}`);
  console.log("");
  console.log("Final balances after both transfers commit:");
  console.table(accounts);
  console.log("");
  console.log("Observation:");
  console.log("- PostgreSQL aborts only one participant when it detects a deadlock.");
  console.log("- The aborted operation retries from BEGIN, including all reads and writes.");
  console.log("- After retry, both transfers commit and total balance remains consistent.");
}

async function transferWithRetry(
  name: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
): Promise<TransferResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await transferOnce(name, fromAccountId, toAccountId, amount, attempt);
      return { name, status: "committed", attempts: attempt };
    } catch (error) {
      if (!isDeadlockDetected(error) || attempt === maxAttempts) {
        throw error;
      }

      console.log(`${name} attempt ${attempt} aborted: ${formatPgError(error)}`);
      await sleep(retryDelayMs * attempt);
    }
  }

  throw new Error(`${name} exhausted retry attempts.`);
}

async function transferOnce(
  name: string,
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  attempt: number,
): Promise<void> {
  const client = await createClient();

  try {
    await client.query("BEGIN");
    await updateAccountBalance(client, fromAccountId, -amount);
    console.log(`${name} attempt ${attempt}: locked ${fromAccountId} and debited ${amount}.`);

    await sleep(transferDelayMs);

    await updateAccountBalance(client, toAccountId, amount);
    await client.query("COMMIT");
    console.log(`${name} attempt ${attempt}: credited ${toAccountId} and committed.`);
  } catch (error) {
    await safeRollback(client);
    throw error;
  } finally {
    await client.end();
  }
}

async function readFinalAccounts() {
  const client = await createClient();

  try {
    return await readAccounts(client);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
