import { executeLabCommand } from "./execute-command";

executeLabCommand("up", "請指定 lab id，例如：npm run lab:up -- database/transaction-isolation").catch(
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  },
);
