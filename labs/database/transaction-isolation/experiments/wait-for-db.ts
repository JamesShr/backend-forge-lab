import { waitForPostgres } from "../../../../shared/postgres/runtime";
import { databaseUrl } from "./db";

async function main(): Promise<void> {
  await waitForPostgres({ databaseUrl });
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
