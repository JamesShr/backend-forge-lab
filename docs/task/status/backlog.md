# Backlog

Backlog 依 roadmap 的 breadth-first 原則維護：先補齊多個 domain 的 L1/L2 接觸面，再挑核心主題進 L3/L4。避免長時間只在單一 domain 裡追加 labs。

## Recently Completed

| Lab / Task | Domain | 結果 |
|---|---|---|
| `distributed-systems/timeout-retry` | Distributed Systems | 已建立 script-only L2 baseline，涵蓋 timeout、bounded retry、exponential backoff 與 retry amplification observation |
| `distributed-systems/idempotency` | Distributed Systems | 已建立 script-only L2 baseline，涵蓋 duplicate request、idempotency key、request fingerprint 與 timeout-after-commit |
| `messaging/kafka-basic` | Messaging | 已建立 Docker Compose L2 baseline，涵蓋 topic、partition、producer、consumer group 與 offset observation |

## Next

下一批優先補 L2 baseline coverage。

| 順序 | Lab / Task | Domain | 目標 |
|---:|---|---|---|
| 1 | `observability/structured-logging` | Observability | 建立 contextual log 與 request correlation baseline |
| 2 | `devops/docker-image-layers` | DevOps | 觀察 image layer、cache、build context |
| 3 | `cloud/aws-service-map` | Cloud | 建立 AWS backend core service positioning 與 cost/cleanup baseline，不建立 billable resources |
| 4 | `kubernetes/readiness-liveness` | Kubernetes | 建立 deployment、service、probe failure baseline |
| 5 | `security/rbac` | Security | 建立 role / permission / authorization decision baseline |
| 6 | `ai/structured-output` | AI | 建立 schema-constrained LLM output 與 validation baseline |

## Planned

| Lab / Task | Domain | 目標 |
|---|---|---|
| `distributed-systems/transactional-outbox` | Distributed Systems | DB transaction 與 message publishing consistency |
| `observability/otel-request-tracing` | Observability | OpenTelemetry tracing |
| `messaging/kafka-duplicate-message` | Messaging | at-least-once delivery 與 idempotent consumer |
| `messaging/kafka-consumer-lag` | Messaging | consumer lag observation |
| `cloud/aws-ecs-rds` | Cloud | ECS + RDS minimal production-like deployment design |
| `kubernetes/rolling-update` | Kubernetes | rollout、rollback、bad deployment observation |
| `security/jwt-authentication` | Security | token、session boundary、basic auth flow |
| `ai/tool-calling-boundary` | AI | LLM tool calling 與 backend capability boundary |

## L3 Deepening Candidates

這些項目在 L2 coverage 更完整後，再依價值挑選深化。

| Lab / Task | Domain | 深化目標 |
|---|---|---|
| `database/indexing-query-plan` | Database | 整理更多 query plan comparison、selectivity trade-off notes、production index design notes |
| `database/connection-pool` | Database | 整理 timeout/backpressure comparison、pool sizing trade-off、operational notes |
| `database/locking` | Database | 補 lock wait observation、`pg_stat_activity` evidence、production notes |
| `distributed-systems/timeout-retry` | Distributed Systems | 從 L2 baseline 深化到 retry storm、backoff、circuit breaker |
| `distributed-systems/idempotency` | Distributed Systems | 從 duplicate request 深化到 timeout-after-commit 與 persistence strategy |
| `messaging/kafka-duplicate-message` | Messaging | 深化 delivery semantics、consumer crash、idempotent consumer |
| `observability/otel-request-tracing` | Observability | 串接跨 service trace 與 latency analysis |

## Later

- Web console / TUI
- Kubernetes / Helm runtime adapter defaults
- Terraform runtime adapter defaults
- Cross-lab report index
- Promotion candidate review for `backend-forge-kit`
