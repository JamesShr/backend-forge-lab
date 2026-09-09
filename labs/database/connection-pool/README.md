# database/connection-pool

## 工程問題

> 當 connection pool 耗盡時，系統會怎樣？不同 pool sizing 與 timeout 策略會帶來哪些 trade-off？

Connection pool exhaustion 是 database-backed 服務最常見的 production 故障之一。這個 lab 使用 `pg.Pool`（node-postgres 內建），在 localhost 模擬：

- Pool 滿了之後的排隊行為與 timeout 失敗
- `connectionTimeoutMillis` 如何決定 fast-fail 或無限等待兩種模式
- 應用層 backpressure（semaphore）如何在 pool 之前主動保護系統
- Pool size 與 throughput / latency 的 trade-off

## Environment

| 項目 | 值 |
|---|---|
| PostgreSQL | 17（Docker，tmpfs） |
| Port | 55437 |
| Database | backend_forge_lab |
| Pool library | `pg.Pool`（node-postgres，已在 dependencies） |

## Schema

```sql
CREATE TABLE work_log (
  id           SERIAL PRIMARY KEY,
  worker_id    TEXT        NOT NULL,
  hold_ms      INTEGER     NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

每個 experiment 用 `pg_sleep(N)` 模擬工作耗時、佔住 connection。完成後將結果寫入 `work_log`，可透過 `lab:observe` 查看累積記錄。

## Experiments

### pool-exhaustion

Pool size = 3，同時發出 20 個 request，每個 hold connection 500ms，timeout = 3000ms。

觀察重點：
- 前 3 個 worker 立即取得連線，其餘 17 個排隊等待
- 排隊超過 3000ms 的 worker 收到 timeout error
- 每個 worker 印出 acquire time、work time、total time 與狀態
- Theoretical minimum wall time = ceil(20 / 3) × 500ms = 3500ms

### timeout-behavior

同樣 pool size = 3、15 concurrent workers、hold = 400ms，比較兩種設定：
- Config A：`connectionTimeoutMillis = 1000`（快速失敗）
- Config B：`connectionTimeoutMillis = 0`（無限等待）

觀察重點：
- Config A：超時的 worker 快速失敗，系統保持響應性
- Config B：所有 worker 最終成功，但 wall time 線性增長
- Trade-off：fast-fail 保護 caller 並可啟用 circuit-breaker；無限等待最大化成功率但可能造成請求積壓雪崩

### backpressure

Pool size = 5，100 concurrent requests，hold = 300ms，比較：
- Strategy A：只靠 pool（queue 無上限）
- Strategy B：pool + semaphore（max inflight = 10，超過立即拒絕）

觀察重點：
- Strategy A：100 個 request 全部排進 pool，wall time ≈ ceil(100/5) × 300ms = 6000ms
- Strategy B：最多 10 個 inflight，超出的立即被拒絕，wall time ≈ ceil(10/5) × 300ms = 600ms
- Trade-off：backpressure 明確拒絕超量請求（類似 503），讓 caller 決定是否 retry

### pool-sizing

固定 workload（50 concurrent，hold = 200ms），比較 pool size = 2 / 5 / 10 / 20。

觀察重點：
- Pool 2 → 5：wall time 與 avg latency 大幅改善
- Pool 5 → 10：改善幅度縮小（diminishing returns）
- Pool 10 → 20：throughput 趨於平穩，connection overhead 開始反噬
- 最佳 pool size 接近 DB host 的 CPU 核心數

## Usage

```bash
# 啟動並初始化
npm run lab:up -- database/connection-pool

# 執行 experiments
npm run lab:run -- database/connection-pool pool-exhaustion
npm run lab:run -- database/connection-pool timeout-behavior
npm run lab:run -- database/connection-pool backpressure
npm run lab:run -- database/connection-pool pool-sizing

# 觀察 DB 狀態
npm run lab:observe -- database/connection-pool

# 產生 HTML report
npm run lab:report -- database/connection-pool

# 清除
npm run lab:destroy -- database/connection-pool --yes
```

## Key Concepts

**connection pool** — 預先建立並重用 DB connections 的 pool，避免每次 query 都建立新連線（每次建立約 5–20ms overhead）。

**pool exhaustion** — pool 內所有 connection 都在使用中，新請求只能等待或超時。

**connectionTimeoutMillis** — 從 pool 取得 connection 的最長等待時間。`0` = 無限等待（pg 預設值）。

**backpressure** — 應用層主動限制 inflight 請求數，超過上限立即拒絕而非排隊。讓系統對 caller 保持可預期的回應時間。

**pool sizing rule of thumb** — 最佳 pool size ≈ DB server 的 CPU core 數（CPU-bound），I/O-bound workload 可略大。過大的 pool 不會提升 throughput，但每個 idle backend 消耗約 5–10 MB PostgreSQL RAM。

## 與 PgBouncer 的關係

這個 lab 聚焦在 **application-level pool**（app process 內，`pg.Pool` 管理）。PgBouncer 是另一層：坐在 app 和 Postgres 之間的 server-side connection proxy，讓多個 app 實例共享更少的真正 DB 連線。兩者解決不同層次的問題，PgBouncer 可另建 `database/pgbouncer` lab 深入探索。
