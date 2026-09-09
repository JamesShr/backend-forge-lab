# Lab: Deadlock

## Problem

兩個 transaction 各自持有一部分 row lock，接著又等待對方手上的 lock 時，PostgreSQL 如何偵測 deadlock？application 應該如何處理被 abort 的 transaction？

## Learning Goal

這個 lab 對應 roadmap 中的 Database Engineering 基礎能力：

- Row lock
- Lock wait
- Deadlock detection
- Transaction abort
- Retry strategy

## Level

目前狀態：L2 active。

目標狀態：逐步推進到 L3，能重現 deadlock、觀察 PostgreSQL deadlock detection 行為，並實作安全的 whole-transaction retry。

## Environment

此 lab 使用 Docker Compose 啟動 PostgreSQL。

```text
PostgreSQL 17
Host port: 55434
Database: backend_forge_lab
User: lab
Password: lab
```

預設連線字串：

```text
postgres://lab:lab@localhost:55434/backend_forge_lab
```

也可以用 `DATABASE_URL` 覆蓋。

## Setup

驗證 Docker Compose 設定：

```bash
npm run lab:prepare -- database/deadlock
```

啟動 PostgreSQL，等待 DB ready，並初始化 `bank_accounts` 資料：

```bash
npm run lab:up -- database/deadlock
```

每個 experiment 都會先 reset 成：

```text
alpha balance = 100
beta balance  = 100
```

## Experiments

### Deadlock

```bash
npm run lab:run -- database/deadlock deadlock
```

此實驗讓兩個 transaction 以相反順序更新同兩筆 account：

```text
T1 locks alpha
T2 locks beta
T1 waits for beta
T2 waits for alpha
```

預期觀察：

```text
one transaction -> SQLSTATE 40P01
one transaction -> commit
total balance   -> 200
```

觀察重點：PostgreSQL 會偵測 lock wait cycle，abort 其中一個 transaction，讓另一個 transaction 可以繼續完成。

### Deadlock Retry

```bash
npm run lab:run -- database/deadlock deadlock-retry
```

此實驗同時執行兩筆相反方向的 transfer：

```text
T1: alpha -> beta, amount = 10
T2: beta  -> alpha, amount = 20
```

如果其中一筆 transfer 被 PostgreSQL 以 `SQLSTATE 40P01` abort，application 會 retry 整個 transfer transaction。

預期觀察：

```text
T1 committed
T2 committed after retry
alpha balance = 110
beta balance  = 90
total balance = 200
retried attempts > 0
```

觀察重點：deadlock retry 必須重跑整個 transaction，不能只 retry 失敗的 SQL statement，因為 transaction 已被 PostgreSQL 標記為 aborted。

## Observation

查看目前資料庫狀態：

```bash
npm run lab:observe -- database/deadlock
```

查看容器狀態：

```bash
npm run lab:status -- database/deadlock
```

查看 PostgreSQL logs：

```bash
npm run lab:logs -- database/deadlock
```

## Planned Next Scenarios

後續可逐步加入：

- 使用 `pg_stat_activity` 觀察 lock wait
- 調整 `deadlock_timeout` 比較 detection latency
- 比較 consistent lock ordering 與 retry strategy
- 累積更多 run artifacts 並補充實際執行結果比較

## Cleanup

停止容器但保留 volume：

```bash
npm run lab:down -- database/deadlock
```

移除容器與 volume：

```bash
npm run lab:reset -- database/deadlock --yes
```

此 lab 的 `reset` 會刪除 PostgreSQL volume，因此 manifest 標記為 destructive，需要明確加上 `--yes`。
