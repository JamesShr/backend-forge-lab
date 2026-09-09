# Lab: Locking

## Problem

PostgreSQL row lock 在 concurrent workers 下會如何影響等待、失敗與工作分配？`SELECT FOR UPDATE`、`NOWAIT`、`SKIP LOCKED` 分別適合什麼情境？

## Learning Goal

這個 lab 對應 roadmap 中的 Database Engineering 操作能力：

- Row lock
- Lock wait
- `SELECT FOR UPDATE`
- `NOWAIT`
- `SKIP LOCKED`
- `pg_stat_activity` observation

## Level

目前狀態：L2 active。

目標狀態：逐步推進到 L3，能重現 row lock wait、觀察 blocked query，並比較 blocking、fail-fast 與 queue worker pattern 的 trade-off。

## Environment

此 lab 使用 Docker Compose 啟動 PostgreSQL。

```text
PostgreSQL 17
Host port: 55435
Database: backend_forge_lab
User: lab
Password: lab
```

預設連線字串：

```text
postgres://lab:lab@localhost:55435/backend_forge_lab
```

也可以用 `DATABASE_URL` 覆蓋。

## Setup

驗證 Docker Compose 設定：

```bash
npm run lab:prepare -- database/locking
```

啟動 PostgreSQL，等待 DB ready，並初始化 `work_items` queue 資料：

```bash
npm run lab:up -- database/locking
```

每個 experiment 都會先 reset 成：

```text
task-1 = pending, priority = 10
task-2 = pending, priority = 20
task-3 = pending, priority = 30
```

## Experiments

### Row Lock Wait

```bash
npm run lab:run -- database/locking row-lock-wait
```

此實驗讓 T1 先鎖住 `task-1`，T2 再對同一列執行 `SELECT ... FOR UPDATE`：

```text
T1 locks task-1
T2 waits for task-1
observer reads pg_stat_activity
T1 commits
T2 acquires task-1
```

觀察重點：plain `SELECT FOR UPDATE` 會等待既有 row lock 釋放。這能保護 row-level correctness，但 caller 會承受 lock wait latency。

### NOWAIT

```bash
npm run lab:run -- database/locking nowait
```

此實驗讓 T1 先鎖住 `task-1`，T2 使用：

```sql
SELECT id FROM work_items WHERE id = 'task-1' FOR UPDATE NOWAIT;
```

預期觀察：

```text
T2 -> SQLSTATE 55P03
```

觀察重點：`NOWAIT` 不等待 lock 釋放，而是立即失敗。適合 caller 可以 retry、選其他工作，或直接回 busy response 的情境。

### SKIP LOCKED

```bash
npm run lab:run -- database/locking skip-locked
```

此實驗讓 T1 先鎖住 `task-1`，worker 使用：

```sql
SELECT id
FROM work_items
WHERE status = 'pending'
ORDER BY priority, id
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

預期觀察：

```text
task-1 locked by T1
worker claims task-2
```

觀察重點：`SKIP LOCKED` 適合 queue workers 彼此避開已鎖住的 row，提高 worker concurrency；但它不保證 strict global ordering。

## Observation

查看目前 work queue 與 lock lab activity：

```bash
npm run lab:observe -- database/locking
```

查看容器狀態：

```bash
npm run lab:status -- database/locking
```

查看 PostgreSQL logs：

```bash
npm run lab:logs -- database/locking
```

## Planned Next Scenarios

後續可逐步加入：

- `lock_timeout` 與 `statement_timeout` 對 lock wait 的影響
- 使用 `pg_locks` 找出 blocker / waiter relation
- 多 worker queue benchmark，比較 throughput 與 fairness
- 與 application-level retry/backoff 策略結合

## Cleanup

停止容器但保留 volume：

```bash
npm run lab:down -- database/locking
```

移除容器與 volume：

```bash
npm run lab:reset -- database/locking --yes
```

此 lab 的 `reset` 會刪除 PostgreSQL volume，因此 manifest 標記為 destructive，需要明確加上 `--yes`。
