# Lab: Idempotency

## Problem

Caller 因 timeout 或 retry 送出 duplicate request 時，backend 如何避免同一個 business operation 被執行兩次？

## Learning Goal

這個 lab 對應 Distributed Systems L2 baseline：

- Duplicate request
- Idempotency key
- Request fingerprint
- Timeout-after-commit
- Side effect consistency

## Level

目前狀態：L2 active。

目標狀態：先建立 script-only 可執行情境，再逐步深化到 L3，加入 persistent key store、concurrent duplicate、TTL、replay window、partial failure 與 observability。

## Background

Timeout 只代表 caller 停止等待，不代表 backend 沒有完成。若 caller 在不知道 backend 結果的情況下重試，而 backend operation 會產生副作用，例如 charge payment、create order、send email，就可能執行兩次。

Idempotency key 的核心不是讓 HTTP response 看起來一樣，而是把 duplicate request 對應到同一個 business operation result：

```text
caller retry with same idempotency key
  -> backend checks key + request fingerprint
  -> first request executes business operation once
  -> duplicate request returns cached committed result
```

## Architecture

此 lab 是 script-only runtime，不啟動 Docker、DB 或外部 service。Experiment scripts 會在 process 內模擬：

```text
caller
  -> client timeout
  -> payment service
  -> in-memory idempotency key store
  -> in-memory business ledger
```

`business ledger` 代表真正的 side effect。`idempotency key store` 代表 backend 用來 deduplicate retry 的邊界。

## Setup

此 lab 不需要啟動 infrastructure。

```bash
npm run lab:prepare -- distributed-systems/idempotency
npm run lab:info -- distributed-systems/idempotency
```

## Experiments

### duplicate-request

```bash
npm run lab:run -- distributed-systems/idempotency duplicate-request
```

觀察重點：

- 第一次 request timeout 後，backend 仍可能繼續 commit。
- Retry 如果沒有 idempotency boundary，同一個 `operationId` 會出現兩筆 ledger entry。
- Caller-visible timeout 不等於 backend-visible rollback。

### idempotency-key

```bash
npm run lab:run -- distributed-systems/idempotency idempotency-key
```

觀察重點：

- 第一次 request 使用 idempotency key 執行 business operation。
- Duplicate request 使用相同 key 與相同 request fingerprint 時，回傳 cached result。
- 相同 key 搭配不同 request fingerprint 時，應被拒絕為 conflict。

### timeout-after-commit

```bash
npm run lab:run -- distributed-systems/idempotency timeout-after-commit
```

觀察重點：

- Backend 在 caller timeout 前已 commit，但 response 尚未回到 caller。
- Retry 使用同一個 idempotency key，可以讀到已 committed result。
- Business ledger 應只保留一筆 side effect。

## Observation

查看 lab 模型摘要：

```bash
npm run lab:observe -- distributed-systems/idempotency
```

每次 `lab:run` 會產生：

```text
labs/distributed-systems/idempotency/runs/<run-id>/
├── metadata.json
└── output.log
```

產生 report：

```bash
npm run lab:report -- distributed-systems/idempotency
```

## Expected Result

這個 lab 應該讓你看到：

- Duplicate request 在沒有 idempotency boundary 時會重複產生 side effect。
- Idempotency key 需要和 request fingerprint 綁定，避免同一個 key 被拿去代表不同 request。
- Timeout-after-commit 是 retry 最危險也最常見的情境之一；backend 必須能回放已 committed result。

## Trade-offs

| Strategy | 優點 | 代價 |
|---|---|---|
| No idempotency | 實作最簡單 | timeout/retry 可能造成重複副作用 |
| Idempotency key + cached result | retry-safe，caller 可以安全重送 | 需要儲存 key、fingerprint、result 與 TTL |
| Conflict on fingerprint mismatch | 防止 key 誤用 | caller 必須穩定產生 key 並保持 payload 一致 |

## Production Considerations

- Idempotency key store 必須具備 atomic reserve / commit 語意。
- Key 應搭配 request fingerprint，不應只看 key 字串。
- Key record 需要 TTL，但 TTL 太短會讓 late retry 失去保護。
- Timeout 後 retry 時，backend 應能回傳已 committed result，而不是重新執行 side effect。
- Production 版本通常會把 idempotency record 和 business transaction 放在同一個資料庫交易邊界內。

## Cleanup

此 lab 沒有外部 infrastructure，也沒有 persistent state。

```bash
npm run lab:down -- distributed-systems/idempotency
```

## Promotion Candidate

目前不建議把 idempotency helper 抽到 `shared/` 或 `backend-forge-kit`。等 transactional outbox、messaging duplicate 與 persistent store labs 都驗證後，再整理穩定的 idempotency abstraction。
