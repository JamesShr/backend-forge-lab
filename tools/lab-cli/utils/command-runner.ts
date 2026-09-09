import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { once } from "node:events";

export interface RunCommandOptions {
  command: string;
  cwd: string;
  logPath?: string;
}

export interface RunCommandResult {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  startedAt: string;
  endedAt: string;
  durationMs: number;
}

export class CommandExecutionError extends Error {
  constructor(
    message: string,
    public readonly result: RunCommandResult,
  ) {
    super(message);
  }
}

export async function runCommand(options: RunCommandOptions): Promise<RunCommandResult> {
  console.log(`$ ${options.command}`);
  console.log(`cwd: ${options.cwd}`);
  console.log("");

  const startedAtMs = Date.now();
  const startedAt = new Date(startedAtMs).toISOString();
  const logStream = options.logPath ? createWriteStream(options.logPath, { encoding: "utf8" }) : undefined;

  logStream?.write(`$ ${options.command}\n`);
  logStream?.write(`cwd: ${options.cwd}\n\n`);

  const result = await new Promise<RunCommandResult>((resolve, reject) => {
    const child = spawn(options.command, {
      cwd: options.cwd,
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    child.stdout.on("data", (chunk: Buffer) => {
      process.stdout.write(chunk);
      logStream?.write(chunk);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      process.stderr.write(chunk);
      logStream?.write(chunk);
    });

    child.on("error", reject);

    child.on("close", (code, signal) => {
      const endedAtMs = Date.now();

      resolve({
        exitCode: code,
        signal,
        startedAt,
        endedAt: new Date(endedAtMs).toISOString(),
        durationMs: endedAtMs - startedAtMs,
      });
    });
  });

  if (logStream) {
    logStream.end();
    await once(logStream, "finish");
  }

  if (result.exitCode === 0) {
    return result;
  }

  if (result.signal) {
    throw new CommandExecutionError(`Command was terminated by signal ${result.signal}.`, result);
  }

  throw new CommandExecutionError(`Command failed with exit code ${result.exitCode ?? "unknown"}.`, result);
}
