# Lab: Indexing & Query Plan

## Problem

當你對 `orders` 資料表下 query，PostgreSQL 是如何決定要用 Sequential Scan 還是 Index Scan？Column 的 selectivity 如何影響這個決策？`EXPLAIN ANALYZE` 輸出的每一行代表什麼？

## Learning Goal

這個 lab 對應 roadmap 中的 Database Engineering 基礎能力：

- Index 結構與 btree index
- Query planner cost estimation
- Selectivity 與 cardinality 的關係
- Sequential Scan vs. Index Scan vs. Index Only Scan
- Covering index 與 heap fetch

## Level

目前狀態：L2 active。

目標狀態：能獨立設計 query、觀察 planner 決策、解釋 selectivity 影響，並理解 covering index 的 trade-off。

## Environment

此 lab 使用 Docker Compose 啟動 PostgreSQL。

```text
PostgreSQL 17
Host port: 55436
Database: backend_forge_lab
User: lab
Password: lab
```

預設連線字串：

```text
postgres://lab:lab@localhost:55436/backend_forge_lab
```

也可以用 `DATABASE_URL` 覆蓋。

## Schema

```sql
CREATE TABLE orders (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT        NOT NULL,   -- 高 cardinality：~10,000 個不同 user
  status     TEXT        NOT NULL,   -- 低 cardinality：pending / processing / completed / cancelled
  amount     INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Seed 資料：100,000 筆。

Status 分佈：

| status     | 比例 |
|---|---:|
| completed  | 60% |
| pending    | 25% |
| processing | 10% |
| cancelled  |  5% |

## Setup

驗證 Docker Compose 設定：

```bash
npm run lab:prepare -- database/indexing-query-plan
```

啟動 PostgreSQL，等待 DB ready，seed 10 萬筆資料：

```bash
npm run lab:up -- database/indexing-query-plan
```

每次 `lab:up` 會重置成只有 `orders_pkey`，所有 experiment 自己建立需要的 index。

## Experiments

### seq-scan

```bash
npm run lab:run -- database/indexing-query-plan seq-scan
```

在沒有任何 index（除 PK）的情況下查詢 `status` 和 `user_id`。

預期觀察：

```text
Seq Scan on orders
  -> 讀取所有 100,000 rows
  -> cost 遠高於 index scan
  -> 兩個 query 的 plan 相同，因為都沒有可用 index
```

### index-scan

```bash
npm run lab:run -- database/indexing-query-plan index-scan
```

在 `user_id` 建立 btree index，查詢單一 user（~10 rows，selectivity ~0.01%）。

預期觀察：

```text
Index Scan using idx_orders_user_id
  -> 只讀取符合條件的少數 rows
  -> actual time 遠低於 Seq Scan
  -> 強制 Seq Scan 的對比顯示 cost 差異
```

### low-selectivity

```bash
npm run lab:run -- database/indexing-query-plan low-selectivity
```

在 `status` 建立 btree index，分別查詢高比例（completed，60%）與低比例（cancelled，5%）。

預期觀察：

```text
WHERE status = 'completed'  -> Seq Scan  (index ignored)
WHERE status = 'cancelled'  -> Bitmap Index Scan  (selective enough)
```

觀察重點：PostgreSQL planner 在 index 存在的情況下，仍然選擇 Seq Scan，因為讀取 60% 的 rows 用 random index access 比循序掃描更慢。

### covering-index

```bash
npm run lab:run -- database/indexing-query-plan covering-index
```

建立 covering index `(user_id) INCLUDE (status, amount)`，查詢只 SELECT 這三個 column。

預期觀察：

```text
Step 1 (無 covering index): Index Scan + heap fetch
Step 2 (有 covering index): Index Only Scan, Heap Fetches: 0
Step 3 (SELECT *):          Index Scan (created_at 不在 index 內，仍需 heap fetch)
```

## Observation

查看目前 indexes 與 planner 統計資訊：

```bash
npm run lab:observe -- database/indexing-query-plan
```

輸出包含：

- 目前存在的 indexes
- `pg_stats`：各欄位的 `n_distinct`、`null_frac`、`correlation`
- `pg_stat_user_tables`：cumulative `seq_scan` vs. `idx_scan` 計數

建議在每個 experiment 前後都執行 `lab:observe`，觀察 scan counter 的變化。

## 讀懂 EXPLAIN ANALYZE 輸出

```text
Seq Scan on orders  (cost=0.00..2831.00 rows=25000 width=52)
                     (actual time=0.012..18.432 rows=24987 loops=1)
```

| 欄位 | 說明 |
|---|---|
| `cost=0.00..2831.00` | Planner 估計的 startup cost 與 total cost（單位：arbitrary planner unit） |
| `rows=25000` | Planner 估計的輸出 rows |
| `actual time=0.012..18.432` | 實際執行的 startup time 與 total time（ms） |
| `rows=24987` | 實際輸出 rows |
| `loops=1` | 這個 node 被執行幾次 |

`Buffers: shared hit=X read=Y` 代表從 shared buffer cache 命中幾個 page，從磁碟讀幾個 page。

## Cleanup

停止容器但保留 volume：

```bash
npm run lab:down -- database/indexing-query-plan
```

移除容器與 volume：

```bash
npm run lab:reset -- database/indexing-query-plan --yes
```

此 lab 的 `reset` 會刪除 PostgreSQL volume，標記為 destructive，需要明確加上 `--yes`。

## Planned Next Scenarios

- Partial index：只為 `status = 'pending'` 建立 index，觀察更小的 index size 與更準確的 selectivity
- Multi-column index：`(user_id, status)` 複合 index，觀察 index condition pushdown
- `correlation` 影響：`created_at` 與實體存放順序高度相關，觀察對 Bitmap Heap Scan 的影響
