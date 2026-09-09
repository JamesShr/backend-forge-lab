import { executeLabCommand } from "./execute-command";

executeLabCommand("reset", "請指定 lab id，例如：npm run lab:reset -- database/transaction-isolation").catch(
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  },
);
