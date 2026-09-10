# Lab Initialization

本文件說明初始化一個 lab 時的基本框架。內容先以目前 `labs/database` 底下已完成的 PostgreSQL labs 為 baseline；未來 Kubernetes、Helm 或 Terraform labs 可以沿用同一個 lab shape，但替換 runtime 與環境配置。

## 基本資料夾

目前 database labs 大多採用以下結構：

```text
labs/<domain>/<scenario>/
├── README.md
├── lab.yaml
├── docker-compose.yml
└── experiments/
    ├── db.ts
    ├── wait-for-db.ts
    ├── reset-data.ts
    ├── observe-state.ts
    └── <experiment>.ts
```

必要檔案：

- `README.md`: 說明 problem、learning goal、environment、experiments、observation、cleanup。
- `lab.yaml`: 給 root runner 掃描與執行的 manifest。
- Runtime config: local PostgreSQL labs 使用 `docker-compose.yml`。
- `experiments/`: 放 scenario-specific scripts。

Generated output 不應手動維護：

```text
runs/<run-id>/
reports/lab-report.html
```

這些檔案由 runner 產生，並由 `.gitignore` 排除。

## PostgreSQL Lab Baseline

目前 database labs 的共同模式是：

- 每個 lab 擁有自己的 PostgreSQL container。
- 每個 lab 使用不同 host port，避免多個 lab 同時啟動時衝突。
- `POSTGRES_DB`、`POSTGRES_USER`、`POSTGRES_PASSWORD` 維持一致，降低 experiment script 的樣板成本。
- `lab:up` 會啟動 Docker Compose、等待 DB ready，然後重設 seed data。
- `observe` 綁定到 `experiments/observe-state.ts`。
- destructive cleanup 需要 `--yes`。

Docker Compose baseline：

```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: backend-forge-lab-<scenario>-postgres
    environment:
      POSTGRES_USER: lab
      POSTGRES_PASSWORD: lab
      POSTGRES_DB: backend_forge_lab
    ports:
      - "<unique-host-port>:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lab -d backend_forge_lab"]
      interval: 2s
      timeout: 3s
      retries: 20

volumes:
  postgres-data:
```

若 lab 會大量建立測試資料、資料不需要保留，也可以使用 `tmpfs` 取代 named volume：

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: backend_forge_lab
      POSTGRES_USER: lab
      POSTGRES_PASSWORD: lab
    ports:
      - "<unique-host-port>:5432"
    tmpfs:
      - /var/lib/postgresql/data
```

## Manifest Baseline

PostgreSQL lab 的 `lab.yaml` 通常長這樣：

```yaml
name: database-<scenario>
domain: database
level: L2
status: active
description: Short sentence describing the engineering behavior this lab reproduces.
skills:
  - transaction
  - locking
roadmap:
  importance: 5
  targetLevel: L3
runtime:
  type: docker-compose
  file: docker-compose.yml
commands:
  up: docker compose up -d && npx tsx experiments/wait-for-db.ts && npx tsx experiments/reset-data.ts
  observe: npx tsx experiments/observe-state.ts
experiments:
  first-experiment:
    command: npx tsx experiments/first-experiment.ts
    description: Describe what behavior this experiment should reveal.
cleanup:
  destructive: true
```

`commands.up` 保留在 manifest，是因為目前 database labs 的啟動流程不只是 `docker compose up -d`，還包含 wait-for-ready 與 seed reset。其他 lifecycle 若沒有 scenario-specific 行為，可交給 runtime adapter default。

## Experiment Scripts

`experiments/` 的基本分工：

| 檔案 | 責任 |
|---|---|
| `db.ts` | 連線字串、PostgreSQL client helper、schema setup、seed/reset helper |
| `wait-for-db.ts` | 等待 PostgreSQL ready，通常由 `commands.up` 呼叫 |
| `reset-data.ts` | 初始化或重設 scenario data |
| `observe-state.ts` | 輸出目前 DB 狀態、lock 狀態或實驗觀察資料 |
| `<experiment>.ts` | 實際重現 failure、load、concurrency 或 trade-off 的實驗 |
| `errors.ts` | 可選；集中 SQLSTATE 或 scenario-specific error formatting |
| `simulation.ts` | 可選；集中 shared simulation helper |

PostgreSQL labs 目前共用 `shared/postgres` 的低階 helper，但 schema、seed、experiment flow 仍保留在各 lab，避免太早抽象。

## README Baseline

每個 lab README 至少應回答：

```text
Problem
Learning Goal
Level
Environment
Setup
Experiments
Observation
Cleanup
```

若 lab 已進入 L3，README 應補上：

```text
Failure / Load
Expected Result
Solution
Trade-offs
Production Considerations
```

## 非 Docker Runtime 的延伸

Kubernetes、Helm 或 Terraform labs 不需要硬套 `docker-compose.yml`，但仍應保留同樣的 lab shape：

```text
labs/<domain>/<scenario>/
├── README.md
├── lab.yaml
├── experiments/
└── runtime-specific-config/
```

建議配置：

| Runtime | 建議配置位置 |
|---|---|
| Docker Compose | `docker-compose.yml` |
| Kubernetes | `k8s/` 或 `manifests/` |
| Helm | `chart/` 或 `helm/` |
| Terraform | `terraform/` |
| Script-only | `experiments/` 與 `config/` |

重點是 root runner 可以透過 `lab.yaml` 找到 runtime、lifecycle 與 experiments；runtime config 的檔名與結構可依技術調整。
