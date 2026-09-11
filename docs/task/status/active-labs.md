# Active Labs

目前 active labs 以 Database 為主，並已開始補 Distributed Systems L2 baseline。這不表示 roadmap 要先把 Database 全部做到 L3 才能進下一個 domain；後續 task 應繼續補 Messaging、Observability 等 L2 baseline。

## 目前 Active Labs

| Lab | Level | Experiments | 狀態 |
|---|---:|---|---|
| `database/transaction-isolation` | L1 -> L3 | `non-repeatable-read`, `repeatable-read`, `serializable-retry` | Active |
| `database/concurrent-inventory` | L2 -> L3 | `naive-update`, `atomic-update`, `optimistic-lock`, `pessimistic-lock` | Active |
| `database/deadlock` | L2 -> L3 | `deadlock`, `deadlock-retry` | Active |
| `database/locking` | L2 -> L3 | `row-lock-wait`, `nowait`, `skip-locked` | Active |
| `database/indexing-query-plan` | L2 | `seq-scan`, `index-scan`, `low-selectivity`, `covering-index` | Active |
| `database/connection-pool` | L3 | `pool-exhaustion`, `timeout-behavior`, `backpressure`, `pool-sizing` | Active |
| `distributed-systems/timeout-retry` | L2 -> L3 | `timeout`, `retry`, `exponential-backoff` | Active |
| `distributed-systems/idempotency` | L2 -> L3 | `duplicate-request`, `idempotency-key`, `timeout-after-commit` | Active |
| `messaging/kafka-basic` | L2 -> L3 | `produce-consume`, `partitioning`, `consumer-offset` | Active |

## Database Progress

目前 Database Foundations 已完成第一批核心 failure scenarios：

- Transaction isolation snapshot 行為
- Serializable transaction abort / retry
- Concurrent inventory lost update
- Atomic update / optimistic lock / pessimistic lock 對照
- PostgreSQL deadlock detection
- Deadlock whole-transaction retry
- Row lock wait observation with `pg_stat_activity`
- `SELECT FOR UPDATE`、`NOWAIT`、`SKIP LOCKED` behavior comparison
- `EXPLAIN ANALYZE` query plan comparison for sequential scan、index scan、low selectivity 與 covering index
- Connection pool exhaustion、timeout behavior、application-layer backpressure 與 pool sizing trade-off

目前已實作的 database labs 已可由 runner 掃描，並已能產生 `runs/` 與 `reports/` evidence。後續 database labs 若繼續深化，應往可觀察性、production notes 與操作問題推進，而不只是新增 SQL 範例。但在 roadmap 節奏上，應同時開始補齊其他 domain 的 L1/L2 lab coverage。

## Distributed Systems Progress

目前 Distributed Systems 已建立第一個 L2 baseline：

- Timeout budget 對 caller-visible latency 與 downstream work 的影響
- Bounded retry 對 transient failure 成功率、attempt count 與 total latency 的影響
- Immediate retry 與 exponential backoff + jitter 的 retry burst / recovery window trade-off
- Duplicate request 在沒有 idempotency boundary 時會重複 business side effect
- Idempotency key + request fingerprint 對 duplicate retry、key conflict 與 timeout-after-commit 的保護

`distributed-systems/timeout-retry` 與 `distributed-systems/idempotency` 都使用 script-only runtime，不啟動外部 infrastructure。前者建立 retry policy 的可觀察行為，後者補上 retry 導致的 duplicate request 與 side effect consistency 問題。

## Messaging Progress

目前 Messaging 已建立第一個 L2 baseline：

- Kafka topic 建立、describe 與 explicit provisioning
- Producer append records 與 consumer from-beginning readback
- Partition key 對 partition placement 與 ordering boundary 的影響
- Consumer group committed offsets、同 group continue 與新 group replay

`messaging/kafka-basic` 使用 Docker Compose 啟動單節點 Kafka KRaft runtime，並透過 Kafka container 內建 CLI 執行 experiments。它先建立 topic / partition / consumer group / offset 的操作面，後續適合接 `messaging/kafka-duplicate-message` 或 `messaging/kafka-consumer-lag` 深化 failure behavior。

## Coverage Gap

目前尚未有 active lab coverage 的主要 domain：

- Observability
- DevOps
- Cloud
- Kubernetes
- Security
- AI

下一批任務應優先補這些 domain 的 L2 baseline，讓學習順序符合「先廣度，再深度」。
