import { waitForPostgres } from "../../../../shared/postgres/runtime";
import { databaseUrl } from "./db";

async function main(): Promise<void> {
  await waitForPostgres({ databaseUrl, applicationName: "connection-pool-wait" });
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
