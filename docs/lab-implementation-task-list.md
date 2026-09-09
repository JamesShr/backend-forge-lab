# Backend Forge Lab 實作清單

> 目的：記錄目前 Lab Framework 能力、已可執行 labs、下一批實作順序與 UI/工具評估。已完成的細節收斂到各 lab README、`lab:info`、run artifacts 與 report。

---

## 狀態標記

| 狀態 | 意義 |
|---|---|
| Done | 已完成並通過基本驗證 |
| Active | 已實作並可被 runner 發現與執行；仍可繼續補 run evidence、observation、failure / trade-off |
| Next | 下一批優先處理項目 |
| Planned | 已列入規劃，但尚未開始 |
| Later | 後續階段再處理 |

---

## 目前完成範圍

### Lab Framework

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
- Done: Shared PostgreSQL runtime helper extraction

目前 runner 支援：

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

### Runtime Adapter

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

---

## Active Labs

| Lab | Level | Experiments | 狀態 |
|---|---:|---|---|
| `database/transaction-isolation` | L1 -> L3 | `non-repeatable-read`, `repeatable-read`, `serializable-retry` | Active |
| `database/concurrent-inventory` | L2 -> L3 | `naive-update`, `atomic-update`, `optimistic-lock`, `pessimistic-lock` | Active |
| `database/deadlock` | L2 -> L3 | `deadlock`, `deadlock-retry` | Active |
| `database/locking` | L2 -> L3 | `row-lock-wait`, `nowait`, `skip-locked` | Active |

### Database Progress

目前 Database Foundations 已完成第一批核心 failure scenarios：

- Transaction isolation snapshot 行為
- Serializable transaction abort / retry
- Concurrent inventory lost update
- Atomic update / optimistic lock / pessimistic lock 對照
- PostgreSQL deadlock detection
- Deadlock whole-transaction retry
- Row lock wait observation with `pg_stat_activity`
- `SELECT FOR UPDATE`、`NOWAIT`、`SKIP LOCKED` behavior comparison

後續 database labs 應往「可觀察性」與「操作問題」推進，而不只是新增 SQL 範例。

---

## Console UI / TUI 評估

### 評估結論

目前先暫緩實作完整 console UI / TUI。

原因：

- 現有 CLI 已完成一致化輸出，短期可讀性足夠。
- `lab:run` 已有 structured run artifacts，`lab:report` 已能產生 HTML summary。
- 目前 active labs 數量只有三個，TUI 對效率提升有限。
- 過早引入 TUI framework 會增加 dependency、互動狀態與測試成本。

### 目前替代方案

短期維持：

```text
lab:list   -> 掃描可用 labs
lab:info   -> 查看 manifest / runtime / experiments
lab:run    -> 執行 experiment 並保存 artifact
lab:report -> 產生 HTML report
```

### 重新評估時機

等以下條件成立時再評估 TUI：

- Active labs 超過 8 到 10 個
- 同一個 lab 有多組 run artifacts 需要互動比較
- 需要跨 lab 篩選 status / level / domain / failed runs
- 需要 watch mode 或 long-running experiments
- 需要半互動式操作 lifecycle：up -> run -> observe -> down

### 可行 UI 方向

若未來要做，建議先做 read-only TUI，再做互動 command：

```text
Phase A: Read-only dashboard
- list labs by domain/status/level
- show latest run status
- open report path

Phase B: Guided runner
- select lab
- select experiment
- run and stream output
- show artifact/report path

Phase C: Watch mode
- watch long-running experiment
- refresh status/logs
- highlight failed runs
```

目前下一步不建議直接做 TUI，應先回到 labs 本身補更多可執行情境。

---

## Backlog

### Next

| 順序 | Lab / Task | Domain | 目標 |
|---:|---|---|---|
| 1 | `database/indexing-query-plan` | Database | 使用 `EXPLAIN` / `EXPLAIN ANALYZE` 觀察 index、selectivity、query plan |
| 2 | `database/connection-pool` | Database | 模擬 pool exhaustion、timeout、backpressure |
| 3 | `distributed-systems/timeout-retry` | Distributed Systems | timeout、retry、exponential backoff、retry storm |
| 4 | `distributed-systems/idempotency` | Distributed Systems | duplicate request 下避免重複 business operation |
| 5 | `distributed-systems/transactional-outbox` | Distributed Systems | DB transaction 與 message publishing consistency |

### Planned

| Lab / Task | Domain | 目標 |
|---|---|---|
| `observability/structured-logging` | Observability | contextual log 與 request correlation |
| `observability/otel-request-tracing` | Observability | OpenTelemetry tracing |
| `messaging/kafka-basic` | Messaging | Topic、partition、producer、consumer |
| `messaging/kafka-duplicate-message` | Messaging | at-least-once delivery 與 idempotent consumer |
| `kubernetes/readiness-liveness` | Kubernetes | probe failure 與 rollout impact |
| `devops/docker-image-layers` | DevOps | image layer、cache、build context |
| `security/rbac` | Security | role / permission / authorization decision |
| `ai/structured-output` | AI | schema-constrained LLM output 與 validation |

### Later

- Web console / TUI
- Kubernetes / Helm runtime adapter defaults
- Terraform runtime adapter defaults
- Cross-lab report index
- Promotion candidate review for `backend-forge-kit`

---

## 維護原則

- 已完成的 implementation 細節不在本文件長期展開，避免 task list 變成流水帳。
- 每個 lab 的情境、實驗、預期結果與 cleanup 寫在該 lab README。
- 每次實驗執行證據以 `runs/<run-id>/metadata.json` 與 `output.log` 保存。
- 只有真正跨兩到三個 labs 重複出現的 runtime plumbing 才抽到 runner 或 shared。
- Scenario-specific schema、seed、failure construction 與 observation 保留在各 lab。
