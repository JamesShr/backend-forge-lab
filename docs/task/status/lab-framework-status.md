# Lab Framework Status

## 狀態標記

| 狀態 | 意義 |
|---|---|
| Done | 已完成並通過基本驗證 |
| Active | 已實作並可被 runner 發現與執行；仍可繼續補 evidence、observation、failure / trade-off |
| Next | 下一批優先處理項目 |
| Planned | 已列入規劃，但尚未開始 |
| Later | 後續階段再處理 |

## 目前完成範圍

已完成最小可用 runner：

- Done: npm / TypeScript 初始化
- Done: `lab.yaml` manifest loader
- Done: `lab:list`
- Done: `lab:info`
- Done: lifecycle command dispatch
- Done: destructive lifecycle safety gate
- Done: structured run artifact
- Done: `lab:report`
- Done: Better CLI formatting
- Done: Runtime adapter abstraction
- Done: Script-only lab support through manifest lifecycle command overrides
- Done: Shared PostgreSQL runtime helper extraction

## Runner 支援範圍

Runner 目前支援固定 command pattern：

```bash
npm run lab:list
npm run lab:info -- <lab-id>
npm run lab:prepare -- <lab-id>
npm run lab:up -- <lab-id>
npm run lab:run -- <lab-id> <experiment>
npm run lab:observe -- <lab-id>
npm run lab:status -- <lab-id>
npm run lab:logs -- <lab-id>
npm run lab:down -- <lab-id>
npm run lab:reset -- <lab-id> --yes
npm run lab:destroy -- <lab-id> --yes
npm run lab:report -- <lab-id>
```

## Run Artifacts

`lab:run` 會產生：

```text
labs/<domain>/<scenario>/runs/<run-id>/
├── metadata.json
└── output.log
```

`lab:report` 會產生：

```text
labs/<domain>/<scenario>/reports/lab-report.html
```

這些 generated output 已由 `.gitignore` 排除。

## Runtime Adapter

目前已提供 `docker-compose` runtime adapter default lifecycle：

| Command | Default |
|---|---|
| `prepare` | `docker compose -f <file> config --quiet` |
| `up` | `docker compose -f <file> up -d` |
| `down` | `docker compose -f <file> down` |
| `reset` | `docker compose -f <file> down -v` |
| `status` | `docker compose -f <file> ps` |
| `logs` | `docker compose -f <file> logs` |
| `destroy` | `docker compose -f <file> down -v` |

Manifest command 仍是 override，適合放 scenario-specific 的 seed、wait、observe 或特殊 lifecycle。

Script-only labs 目前沒有 runtime adapter defaults；它們透過 manifest `commands` 明確定義 `prepare`、`up`、`observe`、`status`、`down` 與 `destroy`。這適合不需要外部 infrastructure 的 L1/L2 lab，例如 timeout / retry policy simulation。
