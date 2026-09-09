import { executeLabCommand } from "./execute-command";

executeLabCommand("prepare", "請指定 lab id，例如：npm run lab:prepare -- database/transaction-isolation").catch(
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  },
);
