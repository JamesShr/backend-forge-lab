# Backend Forge Lab

Backend Forge Lab 是一個以情境為核心的後端工程實驗室，用來學習、重現、破壞、觀察與驗證接近 production 的後端系統行為。

這個 repository 不是正式產品應用，也不是一組彼此獨立的技術 demo。每一個 lab 都應該從一個明確的工程問題出發，接著提供一個小型環境，讓這個問題可以被重現、觀察、修復，並與其他解法進行取捨比較。

## 專案目的

Backend Forge Lab 的目標，是把後端工程概念轉換成可執行的實驗。

主要學習流程是：

```text
Concept
  -> Scenario
  -> Experiment
  -> Failure / Load
  -> Observation
  -> Solution
  -> Trade-off
  -> Reusable Pattern
```

適合的 lab 主題範例：

```text
database/deadlock
database/concurrent-inventory
distributed-systems/idempotency
distributed-systems/transactional-outbox
messaging/kafka-duplicate-message
observability/otel-request-tracing
kubernetes/readiness-failure
cloud/aws-ecs-rds
```

過於寬泛的主題範例：

```text
postgres-demo
kafka-demo
kubernetes-demo
aws-demo
```

目標不只是讓 infrastructure 跑起來，而是理解什麼會失敗、為什麼會失敗、如何觀察失敗，以及不同修復方式會帶來哪些 trade-off。

## 與其他 Backend Forge 專案的關係

Backend Forge 預期會區分學習、實驗與可重用實作。

```text
backend-forge-handbook
  -> 知識、筆記、設計決策、trade-off 分析

backend-forge-lab
  -> 實驗、failure simulation、觀察、驗證

backend-forge-kit
  -> 可重用的後端 library、wrapper、pattern、Nx generator
```

Lab 中的 code 只有在經過足夠多情境驗證，並且值得形成穩定可重用抽象時，才應該移到 `backend-forge-kit`。

## 學習 Roadmap

本專案遵循以下文件定義的學習方向：

- `proposal/backend-skill-development-roadmap.md`
- `proposal/backend-forge-lab-project-guide.md`

目前實作進度與 scenario 撰寫順序記錄於：

- `docs/lab-implementation-task-list.md`

Roadmap 使用四個能力等級：

| Level | 名稱 | 意義 |
|---|---|---|
| L1 | Understand | 能解釋概念並建立最小 demo |
| L2 | Implement | 能獨立建立並執行聚焦的 scenario |
| L3 | Operate | 能重現 failure、觀察行為、debug 並修復 |
| L4 | Design | 能比較架構方案並做 trade-off 決策 |

不是每個 lab 都需要做到 L4。Lab 深度應依照 roadmap 中該主題的目標等級決定。

## 目前 Repository 狀態

此 repository 已完成第一版可用 Lab Framework，並有三個可執行的 PostgreSQL database labs。Runner 目前支援 lab discovery、manifest inspection、lifecycle command dispatch、Docker Compose runtime defaults、structured run artifacts 與 HTML report generation。

```text
backend-forge-lab/
├── README.md
├── package.json
├── package-lock.json
├── proposal/
│   ├── backend-skill-development-roadmap.md
│   └── backend-forge-lab-project-guide.md
├── docs/
├── tools/
│   └── lab-cli/
├── labs/
│   ├── ai/
│   ├── cloud/
│   ├── database/
│   ├── devops/
│   ├── distributed-systems/
│   ├── kubernetes/
│   ├── messaging/
│   ├── observability/
│   └── security/
└── shared/
```

Root package 已初始化，並安裝 TypeScript / YAML 相關依賴。Scenario runner 可以掃描 `labs/**/lab.yaml`、列出 labs、顯示指定 lab 的 metadata，並依照 manifest 或 runtime adapter 執行 lifecycle command 與 experiment。每次 `lab:run` 會保存 `runs/<run-id>/metadata.json` 與 `output.log`，`lab:report` 會從 run artifacts 產生 `reports/lab-report.html`。

## Repository 區域說明

### `proposal/`

來源規劃文件。這些文件定義學習 roadmap、專案理念、初始範圍與 lab 設計規則。

### `docs/`

已實作 lab system 的長期文件。適合放穩定版 guide、CLI reference、architecture notes 與定案後的 conventions。

### `tools/lab-cli/`

Scenario runner 的位置。第一版先保持小而直接，以 script-oriented 的方式實作，再考慮引入完整 CLI framework。

已實作的 root commands：

```bash
npm run lab:list
npm run lab:info -- database/transaction-isolation
npm run lab:prepare -- database/transaction-isolation
npm run lab:up -- database/transaction-isolation
npm run lab:down -- database/transaction-isolation
npm run lab:reset -- database/transaction-isolation
npm run lab:status -- database/transaction-isolation
npm run lab:logs -- database/transaction-isolation
npm run lab:observe -- database/transaction-isolation
npm run lab:destroy -- database/transaction-isolation
npm run lab:run -- database/transaction-isolation non-repeatable-read
npm run lab:run -- database/transaction-isolation repeatable-read
npm run lab:run -- database/transaction-isolation serializable-retry
npm run lab:report -- database/transaction-isolation
npm run lab:info -- database/concurrent-inventory
npm run lab:prepare -- database/concurrent-inventory
npm run lab:up -- database/concurrent-inventory
npm run lab:down -- database/concurrent-inventory
npm run lab:reset -- database/concurrent-inventory
npm run lab:status -- database/concurrent-inventory
npm run lab:logs -- database/concurrent-inventory
npm run lab:observe -- database/concurrent-inventory
npm run lab:destroy -- database/concurrent-inventory
npm run lab:run -- database/concurrent-inventory naive-update
npm run lab:run -- database/concurrent-inventory atomic-update
npm run lab:run -- database/concurrent-inventory optimistic-lock
npm run lab:run -- database/concurrent-inventory pessimistic-lock
npm run lab:report -- database/concurrent-inventory
npm run lab:info -- database/deadlock
npm run lab:prepare -- database/deadlock
npm run lab:up -- database/deadlock
npm run lab:down -- database/deadlock
npm run lab:reset -- database/deadlock
npm run lab:status -- database/deadlock
npm run lab:logs -- database/deadlock
npm run lab:observe -- database/deadlock
npm run lab:destroy -- database/deadlock
npm run lab:run -- database/deadlock deadlock
npm run lab:run -- database/deadlock deadlock-retry
npm run lab:report -- database/deadlock
```

`lab:prepare`、`lab:up`、`lab:down`、`lab:reset`、`lab:status`、`lab:logs`、`lab:observe`、`lab:destroy` 會先讀取指定 lab manifest 的 `commands` 欄位。若 manifest 沒有定義該 lifecycle command，runner 會依 `runtime.type` 使用 runtime adapter default command。

目前 `docker-compose` runtime adapter 會提供：

```text
prepare -> docker compose -f <file> config --quiet
up      -> docker compose -f <file> up -d
down    -> docker compose -f <file> down
reset   -> docker compose -f <file> down -v
status  -> docker compose -f <file> ps
logs    -> docker compose -f <file> logs
destroy -> cleanup.command 或 docker compose -f <file> down -v
```

Manifest 中的 command 仍會優先於 adapter default，適合放每個 scenario 需要的 seed、wait、observe 或特殊 lifecycle。`lab:run` 會讀取 `experiments` 欄位。若 lab 尚未設定對應 command，CLI 會輸出明確錯誤訊息。

每次執行 `lab:run` 都會在該 lab 底下建立 structured run artifact：

```text
labs/<domain>/<scenario>/runs/<run-id>/
├── metadata.json
└── output.log
```

`metadata.json` 會記錄 lab id、experiment name、command、status、start/end time、duration、exit code 與錯誤訊息。`output.log` 會保存 experiment 的 stdout/stderr，方便後續產生 report 或比較多次執行結果。

`lab:report` 會讀取指定 lab 的 run artifacts，產生靜態 HTML report：

```bash
npm run lab:report -- database/transaction-isolation
```

輸出位置：

```text
labs/<domain>/<scenario>/reports/lab-report.html
```

若 lab manifest 標記 `cleanup.destructive: true`，`lab:reset` 與 `lab:destroy` 需要加上 `--yes` 才會執行：

```bash
npm run lab:destroy -- cloud/aws-ecs-rds --yes
```

### `labs/`

依後端工程 domain 分組的 scenario experiments。

每個 lab 都應盡可能 self-contained，並持有自己的 infrastructure、scripts、README、manifest、failure scenario 與 observation notes。

### `shared/`

真正能跨多個 labs 重用的支援資源，例如共用 Docker 片段、scripts、configs、dashboards 與小型 test services。

不要太早把 code 移到這裡。優先允許重複，直到相同 pattern 在兩到三個 labs 中出現，並且呈現清楚的可重用形狀。

目前已抽出第一批 PostgreSQL runtime plumbing：

```text
shared/postgres/
├── client.ts
├── errors.ts
└── runtime.ts
```

這些 helper 只負責 connection lifecycle、wait-for-db、sleep、safe rollback 與 SQLSTATE formatting。Scenario-specific schema、seed、failure construction、experiment flow 與 observation notes 仍保留在各 lab。

## Lab 設計規則

每個 lab 應該回答一個主要工程問題。

一個 lab 應包含：

```text
Problem
Environment
Scenario
Experiment
Failure / Load
Observation
Solution
Trade-off
Cleanup
```

偏好使用聚焦的 scenario 命名：

```text
<domain>/<scenario>
```

範例：

```text
database/transaction-isolation
database/deadlock
distributed-systems/idempotency
messaging/kafka-consumer-lag
observability/prometheus-grafana
kubernetes/rolling-update
security/rbac
ai/structured-output
```

## Lab Manifest

每個 lab 未來都應包含一份 `lab.yaml` manifest，用來描述 metadata 與 lifecycle commands。

範例：

```yaml
name: database-deadlock
domain: database
level: L2
description: Reproduce PostgreSQL transaction deadlock and observe database deadlock detection behavior.
skills:
  - transaction
  - locking
  - deadlock
roadmap:
  importance: 5
  targetLevel: L3
runtime:
  type: docker-compose
  file: docker-compose.yml
commands:
  up: docker compose up -d
  down: docker compose down
  reset: docker compose down -v
experiments:
  deadlock:
    command: npm run experiment:deadlock
cleanup:
  destructive: false
```

## 建議第一批 Labs

建議先從 database labs 開始，因為它們需要的 infrastructure 最少，也能快速驗證 lab structure。

建議順序：

```text
1. database/transaction-isolation
2. database/concurrent-inventory
3. database/deadlock
4. distributed-systems/timeout-retry
5. distributed-systems/idempotency
6. distributed-systems/transactional-outbox
7. observability/otel-request-tracing
```

Kafka、Kubernetes、Terraform 與 AWS labs 應該等 basic runner 以及第一批 local database / distributed-system scenarios 可運作後再進行。

## 開發原則

- 從工程問題出發，而不是從工具出發。
- 每個 lab 聚焦在一個主要 scenario。
- 使用能重現行為的最小 infrastructure。
- 不要過度工程化 L1 或 L2 labs。
- 當 lab 要推進到 L3 時，再加入 failure、load 與 observability。
- 當 lab 要推進到 L4 時，再加入 architecture trade-off 比較。
- 不要在 repeated patterns 證明價值前建立 shared abstractions。
- Cloud labs 涉及 billable infrastructure，必須永遠記錄 cleanup。

## 初始設定

安裝依賴：

```bash
npm install
```

TypeScript tooling 可透過 local dev dependencies 使用：

```bash
npx tsx --version
npx tsc --version
```

目前可用的 lab runner commands：

```bash
npm run lab:list
npm run lab:info -- database/transaction-isolation
npm run lab:prepare -- database/transaction-isolation
npm run lab:up -- database/transaction-isolation
npm run lab:down -- database/transaction-isolation
npm run lab:reset -- database/transaction-isolation
npm run lab:status -- database/transaction-isolation
npm run lab:logs -- database/transaction-isolation
npm run lab:observe -- database/transaction-isolation
npm run lab:destroy -- database/transaction-isolation
npm run lab:run -- database/transaction-isolation non-repeatable-read
npm run lab:run -- database/transaction-isolation repeatable-read
npm run lab:run -- database/transaction-isolation serializable-retry
npm run lab:report -- database/transaction-isolation
npm run lab:info -- database/concurrent-inventory
npm run lab:prepare -- database/concurrent-inventory
npm run lab:up -- database/concurrent-inventory
npm run lab:down -- database/concurrent-inventory
npm run lab:reset -- database/concurrent-inventory
npm run lab:status -- database/concurrent-inventory
npm run lab:logs -- database/concurrent-inventory
npm run lab:observe -- database/concurrent-inventory
npm run lab:destroy -- database/concurrent-inventory
npm run lab:run -- database/concurrent-inventory naive-update
npm run lab:run -- database/concurrent-inventory atomic-update
npm run lab:run -- database/concurrent-inventory optimistic-lock
npm run lab:run -- database/concurrent-inventory pessimistic-lock
npm run lab:report -- database/concurrent-inventory
npm run lab:info -- database/deadlock
npm run lab:prepare -- database/deadlock
npm run lab:up -- database/deadlock
npm run lab:down -- database/deadlock
npm run lab:reset -- database/deadlock
npm run lab:status -- database/deadlock
npm run lab:logs -- database/deadlock
npm run lab:observe -- database/deadlock
npm run lab:destroy -- database/deadlock
npm run lab:run -- database/deadlock deadlock
npm run lab:run -- database/deadlock deadlock-retry
npm run lab:report -- database/deadlock
```

型別檢查：

```bash
npm run typecheck
```

目前的 `database/transaction-isolation` 已是可執行 lab，提供 PostgreSQL Docker Compose runtime，以及 `non-repeatable-read`、`repeatable-read`、`serializable-retry` 三個 experiments。

目前的 `database/concurrent-inventory` 已是可執行 lab，提供 PostgreSQL Docker Compose runtime，以及 `naive-update`、`atomic-update`、`optimistic-lock`、`pessimistic-lock` 四個 experiments。

目前的 `database/deadlock` 已是可執行 lab，提供 PostgreSQL Docker Compose runtime，以及 `deadlock`、`deadlock-retry` 兩個 experiments。

每次執行 `lab:run` 都會產生 `runs/<run-id>/metadata.json` 與 `output.log`。這些 run artifacts 是 generated output，已由 `.gitignore` 排除。

`lab:report` 會根據 run artifacts 產生 `reports/lab-report.html`。Report 也是 generated output，已由 `.gitignore` 排除。

CLI 輸出已統一使用 heading、key/value、status 與 duration 格式，方便掃描 lab 狀態、執行命令與 experiment 結果。

Lifecycle commands 已加入 runtime adapter abstraction。三個 PostgreSQL labs 目前只在 manifest 保留 scenario-specific 的 `up` 與 `observe`，其餘 Docker Compose lifecycle defaults 由 runner adapter 提供。

## Cloud 安全

Cloud labs 必須清楚記錄 billable resources 與 cleanup commands。

Terraform-based labs 應偏好明確的 destroy lifecycle：

```bash
npm run lab:destroy -- cloud/aws-ecs-rds --yes
```

任何 cloud lab 如果沒有記錄如何移除 billable resources，都不應視為完成。

## 指導原則

不要只是讓它跑起來。

要讓它失敗、觀察它為什麼失敗、修復它，並理解其中的 trade-off。
