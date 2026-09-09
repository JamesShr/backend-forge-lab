import { resetAccounts } from "./db";

async function main(): Promise<void> {
  await resetAccounts();
  console.log("Account data reset: alpha balance = 100, beta balance = 100");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
