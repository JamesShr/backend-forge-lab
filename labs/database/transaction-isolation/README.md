# Lab: Transaction Isolation

## Problem

不同 PostgreSQL transaction isolation level 在 concurrent reads / writes 下會產生哪些可觀察行為？

## Learning Goal

這個 lab 對應 roadmap 中的 Database Engineering 基礎能力：

- Transaction
- Isolation Level
- Concurrency
- Consistency

## Level

目前狀態：L1 active。

目標狀態：逐步推進到 L3，能重現 isolation anomaly、觀察資料庫行為，並比較不同 isolation level 的 trade-off。

## Environment

此 lab 使用 Docker Compose 啟動 PostgreSQL。

```text
PostgreSQL 17
Host port: 55432
Database: backend_forge_lab
User: lab
Password: lab
```

預設連線字串：

```text
postgres://lab:lab@localhost:55432/backend_forge_lab
```

也可以用 `DATABASE_URL` 覆蓋。

## Setup

驗證 Docker Compose 設定：

```bash
npm run lab:prepare -- database/transaction-isolation
```

啟動 PostgreSQL，等待 DB ready，並初始化 `inventory_items` 資料：

```bash
npm run lab:up -- database/transaction-isolation
```

## Experiments

### Non-repeatable Read

```bash
npm run lab:run -- database/transaction-isolation non-repeatable-read
```

此實驗使用 `READ COMMITTED`：

```text
T1 first read  -> stock = 10
T2 update      -> stock = 25
T2 commit
T1 second read -> stock = 25
```

觀察重點：在 PostgreSQL `READ COMMITTED` 下，同一個 transaction 中的不同 statement 會讀取各自執行當下最新的 committed snapshot。

### Repeatable Read

```bash
npm run lab:run -- database/transaction-isolation repeatable-read
```

此實驗使用 `REPEATABLE READ`：

```text
T1 first read  -> stock = 10
T2 update      -> stock = 25
T2 commit
T1 second read -> stock = 10
new tx read    -> stock = 25
```

觀察重點：在 PostgreSQL `REPEATABLE READ` 下，同一個 transaction 會維持穩定 snapshot；其他 transaction 已 commit 的更新，要等新的 transaction 才看得到。

### Serializable Retry

```bash
npm run lab:run -- database/transaction-isolation serializable-retry
```

此實驗使用 `SERIALIZABLE`：

```text
T1 first read  -> stock = 10
T2 first read  -> stock = 10
T1 commit      -> stock = 15
T2 update      -> SQLSTATE 40001
T2 retry read  -> stock = 15
T2 retry commit -> stock = 20
```

觀察重點：在 PostgreSQL `SERIALIZABLE` 下，conflicting concurrent transaction 可能被 abort，application 需要 retry 整個 transaction，而不是只 retry 失敗的 statement。

## Observation

查看目前資料庫狀態：

```bash
npm run lab:observe -- database/transaction-isolation
```

查看容器狀態：

```bash
npm run lab:status -- database/transaction-isolation
```

查看 PostgreSQL logs：

```bash
npm run lab:logs -- database/transaction-isolation
```

## Planned Next Scenarios

後續可逐步加入：

- Concurrent inventory update
- Phantom read / predicate read 行為分析
- Isolation level trade-off notes

## Cleanup

停止容器但保留 volume：

```bash
npm run lab:down -- database/transaction-isolation
```

移除容器與 volume：

```bash
npm run lab:reset -- database/transaction-isolation --yes
```

此 lab 的 `reset` 會刪除 PostgreSQL volume，因此 manifest 標記為 destructive，需要明確加上 `--yes`。
