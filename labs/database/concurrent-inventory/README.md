# Lab: Concurrent Inventory

## Problem

多個 buyer 同時購買同一個 SKU 時，哪些 inventory update 寫法會造成 lost update 或 oversell？不同修復方式的正確性與 trade-off 是什麼？

## Learning Goal

這個 lab 對應 roadmap 中的 Database Engineering 基礎能力：

- Concurrent update
- Atomic conditional update
- Optimistic locking
- Pessimistic locking
- Retry strategy

## Level

目前狀態：L2 active。

目標狀態：逐步推進到 L3，能重現 concurrent inventory failure、觀察不同修復策略的行為，並比較 correctness、throughput、latency 與 implementation complexity。

## Environment

此 lab 使用 Docker Compose 啟動 PostgreSQL。

```text
PostgreSQL 17
Host port: 55433
Database: backend_forge_lab
User: lab
Password: lab
```

預設連線字串：

```text
postgres://lab:lab@localhost:55433/backend_forge_lab
```

也可以用 `DATABASE_URL` 覆蓋。

## Setup

驗證 Docker Compose 設定：

```bash
npm run lab:prepare -- database/concurrent-inventory
```

啟動 PostgreSQL，等待 DB ready，並初始化 `inventory_items` 資料：

```bash
npm run lab:up -- database/concurrent-inventory
```

每個 experiment 都會先 reset 成：

```text
stock = 10
version = 0
concurrent buyers = 20
```

## Experiments

### Naive Update

```bash
npm run lab:run -- database/concurrent-inventory naive-update
```

此實驗讓所有 buyer 先讀到同一個 stock，再寫回 `stock - 1` 的絕對值。

預期觀察：

```text
purchased buyers = 20
final stock       = 9
```

觀察重點：系統接受了 20 筆購買，但庫存只從 10 移動到 9。這是 read-modify-write 在 concurrent update 下的 lost update 問題。

### Atomic Update

```bash
npm run lab:run -- database/concurrent-inventory atomic-update
```

此實驗使用單一 conditional update：

```sql
UPDATE inventory_items
SET stock = stock - 1
WHERE id = 'widget'
  AND stock > 0
RETURNING stock;
```

預期觀察：

```text
purchased buyers = 10
sold-out buyers  = 10
final stock      = 0
```

觀察重點：stock check 與 decrement 在同一個 SQL statement 內完成，資料庫會處理同一列的 concurrent update 排序。

### Optimistic Lock

```bash
npm run lab:run -- database/concurrent-inventory optimistic-lock
```

此實驗使用 `version` 欄位做 conditional update，遇到 version conflict 時 retry 整個 purchase operation。

預期觀察：

```text
purchased buyers = 10
sold-out buyers  = 10
final stock      = 0
final version    = 10
retried attempts > 0
```

觀察重點：optimistic locking 不阻擋讀取，但需要偵測 conflict 並設計 retry。contention 越高，retry 次數越多。

### Pessimistic Lock

```bash
npm run lab:run -- database/concurrent-inventory pessimistic-lock
```

此實驗使用 `SELECT ... FOR UPDATE` 在 transaction 中鎖住 inventory row。

預期觀察：

```text
purchased buyers = 10
sold-out buyers  = 10
final stock      = 0
final version    = 10
```

觀察重點：pessimistic locking 讓 buyers 等待 row lock，避免 stale read race，但 high contention 下會增加 lock wait time。

## Observation

查看目前資料庫狀態：

```bash
npm run lab:observe -- database/concurrent-inventory
```

查看容器狀態：

```bash
npm run lab:status -- database/concurrent-inventory
```

查看 PostgreSQL logs：

```bash
npm run lab:logs -- database/concurrent-inventory
```

## Planned Next Scenarios

後續可逐步加入：

- 更完整的 lock wait observation
- 使用 `pg_stat_activity` 觀察 blocked queries
- 比較 optimistic retry backoff 策略
- 累積更多 run artifacts 並補充實際執行結果比較

## Cleanup

停止容器但保留 volume：

```bash
npm run lab:down -- database/concurrent-inventory
```

移除容器與 volume：

```bash
npm run lab:reset -- database/concurrent-inventory --yes
```

此 lab 的 `reset` 會刪除 PostgreSQL volume，因此 manifest 標記為 destructive，需要明確加上 `--yes`。
