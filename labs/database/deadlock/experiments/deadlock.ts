import { createClient, readAccounts, resetAccounts, safeRollback, updateAccountBalance } from "./db";
import { formatPgError, isDeadlockDetected } from "./errors";

type TransactionName = "T1" | "T2";

interface DeadlockVictim {
  name: TransactionName;
  reason: { code: string; message: string; detail?: string };
}

async function main(): Promise<void> {
  await resetAccounts();

  const tx1 = await createClient();
  const tx2 = await createClient();

  try {
    console.log("Scenario: two transactions update the same rows in opposite order and deadlock.");
    console.log("");
    console.log("Initial balances: alpha = 100, beta = 100");

    await tx1.query("BEGIN");
    await tx2.query("BEGIN");

    await updateAccountBalance(tx1, "alpha", -10);
    console.log("T1 locked alpha and debited 10.");

    await updateAccountBalance(tx2, "beta", -20);
    console.log("T2 locked beta and debited 20.");

    console.log("");
    console.log("Creating lock cycle...");

    const tx1SecondUpdate = updateAccountBalance(tx1, "beta", 10);
    const tx2SecondUpdate = updateAccountBalance(tx2, "alpha", 20);
    const [tx1Result, tx2Result] = await Promise.allSettled([tx1SecondUpdate, tx2SecondUpdate]);

    const victim = findDeadlockVictim(tx1Result, tx2Result);
    const winner = victim?.name === "T1" ? "T2" : "T1";

    if (!victim) {
      throw new Error("Expected a PostgreSQL deadlock, but neither transaction failed with SQLSTATE 40P01.");
    }

    console.log(`${victim.name} aborted: ${formatPgError(victim.reason)}`);
    console.log(`${winner} can continue after PostgreSQL aborts the deadlock victim.`);

    if (winner === "T1") {
      await tx1.query("COMMIT");
      await safeRollback(tx2);
    } else {
      await tx2.query("COMMIT");
      await safeRollback(tx1);
    }

    const accounts = await readFinalAccounts();

    console.log("");
    console.log("Final balances after the surviving transaction commits:");
    console.table(accounts);
    console.log("");
    console.log("Observation:");
    console.log("- T1 held a row lock on alpha and waited for beta.");
    console.log("- T2 held a row lock on beta and waited for alpha.");
    console.log("- PostgreSQL detected the wait cycle and aborted one transaction with SQLSTATE 40P01.");
  } catch (error) {
    await safeRollback(tx1);
    await safeRollback(tx2);
    throw error;
  } finally {
    await tx1.end();
    await tx2.end();
  }
}

function findDeadlockVictim(
  tx1Result: PromiseSettledResult<void>,
  tx2Result: PromiseSettledResult<void>,
): DeadlockVictim | undefined {
  if (tx1Result.status === "rejected" && isDeadlockDetected(tx1Result.reason)) {
    return { name: "T1", reason: tx1Result.reason };
  }

  if (tx2Result.status === "rejected" && isDeadlockDetected(tx2Result.reason)) {
    return { name: "T2", reason: tx2Result.reason };
  }

  return undefined;
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
