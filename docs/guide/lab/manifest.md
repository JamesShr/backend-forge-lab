# Lab Manifest

每一個 lab 應提供 `lab.yaml`，用來描述 metadata 與 execution lifecycle。

## 範例

```yaml
name: database-deadlock
domain: database
level: L2
description: Reproduce PostgreSQL transaction deadlock and observe database deadlock detection behavior.
status: active
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
  observe: tsx experiments/observe-state.ts
experiments:
  deadlock:
    command: tsx experiments/deadlock.ts
    description: Create two transactions that lock rows in opposite order.
cleanup:
  destructive: false
```

## Manifest 責任

Manifest 應描述 lab 的執行邊界：

- Lab identity
- Domain 與 target level
- Runtime type
- Lifecycle command overrides
- Experiment commands
- Cleanup safety

Manifest 不應成為完整 README，也不應把所有觀察結論寫在 YAML 裡。

## Supported Runtime Types

```text
docker-compose
kubernetes
helm
terraform
script
```

## Command Override 原則

Runner 會優先使用 manifest 的 `commands`。若未定義，才由 runtime adapter 提供 default lifecycle。

Manifest command 適合放：

- Scenario-specific seed
- Wait-for-ready
- Observe script
- 特殊 cleanup
- Lab-specific infrastructure command
