import { promises as fs } from "node:fs";
import path from "node:path";
import type { LabDefinition } from "../manifest/lab-manifest.type";
import {
  loadRunArtifacts,
  type PersistedRunArtifact,
  type RunArtifactStatus,
} from "../run-artifacts/run-artifact";
import { resolveLabOrExit } from "../utils/lab-resolver";
import { printFailure, printHeading, printKeyValues, printSuccess } from "../utils/console";

const outputPreviewLimit = 20_000;

async function main(): Promise<void> {
  const lab = await resolveLabOrExit(
    process.argv[2],
    "請指定 lab id，例如：npm run lab:report -- database/transaction-isolation",
  );

  if (!lab) {
    return;
  }

  const artifacts = await loadRunArtifacts(lab);

  if (artifacts.length === 0) {
    printFailure(`Lab ${lab.id} 目前沒有 run artifacts。請先執行 npm run lab:run -- ${lab.id} <experiment>。`);
    process.exitCode = 1;
    return;
  }

  const reportsDirectory = path.join(lab.directory, "reports");
  const reportPath = path.join(reportsDirectory, "lab-report.html");

  await fs.mkdir(reportsDirectory, { recursive: true });
  await fs.writeFile(reportPath, renderReport(lab, artifacts), "utf8");

  printHeading("Lab report");
  printKeyValues([
    { label: "Lab", value: lab.id },
    { label: "Report", value: reportPath },
    { label: "Runs included", value: artifacts.length },
  ]);
  console.log("");
  printSuccess("Report generated.");
}

function renderReport(lab: LabDefinition, artifacts: PersistedRunArtifact[]): string {
  const generatedAt = new Date().toISOString();
  const counts = countStatuses(artifacts);
  const latestRun = artifacts[0];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(lab.id)} - Lab Report</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fa;
      --panel: #ffffff;
      --text: #18202a;
      --muted: #5d6876;
      --border: #d9dee7;
      --success: #197a43;
      --failed: #b42318;
      --running: #946200;
      --code-bg: #111827;
      --code-text: #e5e7eb;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }

    main {
      max-width: 1120px;
      margin: 0 auto;
      padding: 32px 20px 48px;
    }

    h1, h2, h3 {
      line-height: 1.2;
      margin: 0;
    }

    h1 {
      font-size: 28px;
    }

    h2 {
      font-size: 20px;
      margin-top: 32px;
    }

    h3 {
      font-size: 16px;
    }

    p {
      margin: 8px 0 0;
    }

    .muted {
      color: var(--muted);
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-top: 20px;
    }

    .metric, .run {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
    }

    .metric {
      padding: 14px 16px;
    }

    .metric-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      text-align: left;
      vertical-align: top;
      font-size: 14px;
    }

    th {
      background: #eef1f5;
      color: #303947;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    .status {
      display: inline-block;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 700;
    }

    .status-success {
      background: #e7f5ed;
      color: var(--success);
    }

    .status-failed {
      background: #fdecec;
      color: var(--failed);
    }

    .status-running {
      background: #fff4d8;
      color: var(--running);
    }

    .runs {
      display: grid;
      gap: 16px;
      margin-top: 16px;
    }

    .run {
      padding: 16px;
    }

    .run-header {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      justify-content: space-between;
      align-items: baseline;
    }

    dl {
      display: grid;
      grid-template-columns: minmax(120px, 180px) 1fr;
      gap: 6px 12px;
      margin: 14px 0;
    }

    dt {
      color: var(--muted);
    }

    dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    pre {
      margin: 12px 0 0;
      padding: 14px;
      background: var(--code-bg);
      color: var(--code-text);
      border-radius: 8px;
      overflow: auto;
      font-size: 13px;
      line-height: 1.45;
      max-height: 420px;
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(lab.id)} Lab Report</h1>
      <p class="muted">${escapeHtml(lab.manifest.description)}</p>
      <p class="muted">Generated at ${escapeHtml(generatedAt)}</p>
    </header>

    <section class="summary" aria-label="Run summary">
      ${renderMetric("Runs", String(artifacts.length))}
      ${renderMetric("Success", String(counts.success))}
      ${renderMetric("Failed", String(counts.failed))}
      ${renderMetric("Running", String(counts.running))}
      ${renderMetric("Latest Run", latestRun ? formatDate(latestRun.metadata.startedAt) : "n/a")}
    </section>

    <section>
      <h2>Run Index</h2>
      <table>
        <thead>
          <tr>
            <th>Started</th>
            <th>Experiment</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Exit</th>
          </tr>
        </thead>
        <tbody>
          ${artifacts.map(renderRunIndexRow).join("\n")}
        </tbody>
      </table>
    </section>

    <section>
      <h2>Run Details</h2>
      <div class="runs">
        ${artifacts.map(renderRunDetail).join("\n")}
      </div>
    </section>
  </main>
</body>
</html>
`;
}

function renderMetric(label: string, value: string): string {
  return `<div class="metric"><span class="muted">${escapeHtml(label)}</span><span class="metric-value">${escapeHtml(value)}</span></div>`;
}

function renderRunIndexRow(artifact: PersistedRunArtifact): string {
  const { metadata } = artifact;

  return `<tr>
            <td>${escapeHtml(formatDate(metadata.startedAt))}</td>
            <td>${escapeHtml(metadata.experimentName)}</td>
            <td>${renderStatus(metadata.status)}</td>
            <td>${escapeHtml(formatDuration(metadata.durationMs))}</td>
            <td>${escapeHtml(formatExit(metadata.exitCode, metadata.signal))}</td>
          </tr>`;
}

function renderRunDetail(artifact: PersistedRunArtifact): string {
  const { metadata } = artifact;
  const output = truncateOutput(artifact.outputLog);

  return `<article class="run">
          <div class="run-header">
            <h3>${escapeHtml(metadata.experimentName)}</h3>
            ${renderStatus(metadata.status)}
          </div>
          <p class="muted">${escapeHtml(metadata.runId)}</p>
          <dl>
            <dt>Description</dt>
            <dd>${escapeHtml(metadata.experimentDescription ?? "n/a")}</dd>
            <dt>Command</dt>
            <dd><code>${escapeHtml(metadata.command)}</code></dd>
            <dt>Started</dt>
            <dd>${escapeHtml(formatDate(metadata.startedAt))}</dd>
            <dt>Ended</dt>
            <dd>${escapeHtml(metadata.endedAt ? formatDate(metadata.endedAt) : "n/a")}</dd>
            <dt>Duration</dt>
            <dd>${escapeHtml(formatDuration(metadata.durationMs))}</dd>
            <dt>Exit</dt>
            <dd>${escapeHtml(formatExit(metadata.exitCode, metadata.signal))}</dd>
            <dt>Metadata</dt>
            <dd>${escapeHtml(metadataPathRelative(artifact))}</dd>
            <dt>Output</dt>
            <dd>${escapeHtml(outputPathRelative(artifact))}</dd>
            ${metadata.errorMessage ? `<dt>Error</dt><dd>${escapeHtml(metadata.errorMessage)}</dd>` : ""}
          </dl>
          <pre>${escapeHtml(output)}</pre>
        </article>`;
}

function countStatuses(artifacts: PersistedRunArtifact[]): Record<RunArtifactStatus, number> {
  return artifacts.reduce(
    (counts, artifact) => {
      counts[artifact.metadata.status] += 1;
      return counts;
    },
    { running: 0, success: 0, failed: 0 },
  );
}

function renderStatus(status: RunArtifactStatus): string {
  return `<span class="status status-${status}">${escapeHtml(status)}</span>`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function formatDuration(value: number | null): string {
  return value === null ? "n/a" : `${value}ms`;
}

function formatExit(exitCode: number | null, signal: string | null): string {
  if (signal) {
    return `signal ${signal}`;
  }

  return exitCode === null ? "n/a" : String(exitCode);
}

function truncateOutput(value: string): string {
  if (value.length <= outputPreviewLimit) {
    return value;
  }

  const omitted = value.length - outputPreviewLimit;

  return `${value.slice(0, outputPreviewLimit)}\n\n[output truncated: ${omitted} characters omitted]`;
}

function metadataPathRelative(artifact: PersistedRunArtifact): string {
  return path.relative(artifact.directory, artifact.metadataPath);
}

function outputPathRelative(artifact: PersistedRunArtifact): string {
  return path.relative(artifact.directory, artifact.outputLogPath);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
