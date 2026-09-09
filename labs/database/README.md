# Database Labs

Database labs 用來把 SQL / ORM 使用經驗推進到 production database engineering：transaction boundary、isolation、lock、index、query plan、pool、migration 與 reliability。

## 目前已實作

| Lab | Level | 重點 |
|---|---:|---|
| `database/transaction-isolation` | L1 -> L3 | `READ COMMITTED`、`REPEATABLE READ`、`SERIALIZABLE` retry |
| `database/concurrent-inventory` | L2 -> L3 | lost update、atomic update、optimistic lock、pessimistic lock |
| `database/deadlock` | L2 -> L3 | deadlock detection、`SQLSTATE 40P01`、whole-transaction retry |
| `database/locking` | L2 -> L3 | row lock wait、`SELECT FOR UPDATE`、`NOWAIT`、`SKIP LOCKED` |

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `database/indexing-query-plan` | 使用 `EXPLAIN` / `EXPLAIN ANALYZE` 觀察 index、selectivity、query plan |
| 2 | `database/connection-pool` | 模擬 pool exhaustion、timeout、backpressure |
| 3 | `database/migration-zero-downtime` | additive migration、backfill、expand-contract |
| 4 | `database/backup-restore` | backup、restore、PITR 概念演練 |
| 5 | `database/partitioning` | range/list partition、query pruning、維運 trade-off |
| 6 | `database/read-replica-lag` | read scaling、replication lag、read-after-write consistency |

## 工具 / 操作練習

- PostgreSQL transaction 與 lock inspection
- `pg_stat_activity` / blocked query observation
- `EXPLAIN` / `EXPLAIN ANALYZE`
- index design 與 query benchmark
- connection pool sizing
- migration rollout / rollback drill

## 設計原則

- 每個 lab 聚焦一個 database failure 或 performance problem。
- Schema、seed、failure construction 保留在各 lab，避免把概念抽掉。
- 共用只限 runtime plumbing，例如 PostgreSQL connection helper、error code helper、wait-for-db。
