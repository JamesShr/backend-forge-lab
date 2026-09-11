# Lab: Timeout & Retry

## Problem

當 downstream service 變慢或偶發失敗時，client timeout、retry 次數與 backoff 策略會如何影響成功率、延遲與請求放大？

## Learning Goal

這個 lab 對應 roadmap 中的 Distributed Systems L2 baseline：

- Timeout budget
- Transient failure
- Bounded retry
- Exponential backoff
- Retry amplification

## Level

目前狀態：L2 active。

目標狀態：先建立最小可執行情境，再逐步深化到 L3，加入 retry storm、jitter、circuit breaker 與 idempotency boundary。

## Background

Distributed system 的 remote call 可能遇到三種常見狀況：

- Downstream 成功，但比 caller 願意等待的時間更慢。
- Downstream 發生 transient error，短時間後恢復。
- Downstream 持續故障，retry 只會放大壓力。

Timeout 和 retry 不是單獨的 utility。它們必須跟 operation semantics 一起設計：read-only 或 idempotent operation 通常比較適合 retry；會造成副作用的 operation 必須搭配 idempotency key、deduplication 或 transaction boundary。

## Architecture

此 lab 是 script-only runtime，不啟動 Docker 或外部 service。Experiment scripts 會在 process 內模擬：

```text
client
  -> timeout wrapper
  -> retry policy
  -> simulated downstream latency / transient error
```

這讓 lab 專注在 timeout / retry policy 的行為，不被 HTTP server、Docker network 或 framework 細節干擾。

## Setup

此 lab 不需要啟動 infrastructure。

```bash
npm run lab:prepare -- distributed-systems/timeout-retry
npm run lab:info -- distributed-systems/timeout-retry
```

## Experiments

### timeout

```bash
npm run lab:run -- distributed-systems/timeout-retry timeout
```

觀察重點：

- timeout 太短時，client 會先放棄，但 downstream 可能仍在消耗資源。
- timeout 較長時，同一個 slow response 可能成功，但 caller latency 也會變高。
- fast failure 不應被誤判成 timeout。

### retry

```bash
npm run lab:run -- distributed-systems/timeout-retry retry
```

觀察重點：

- no-retry 對 transient error 很敏感，第一個錯誤就讓 operation 失敗。
- bounded retry 可以吸收短暫故障，但會增加 attempts 與 total latency。
- retry 必須有上限，否則持續故障會變成 request amplification。

### exponential-backoff

```bash
npm run lab:run -- distributed-systems/timeout-retry exponential-backoff
```

觀察重點：

- immediate retry 會把 attempts 壓在很短時間內，downstream 剛故障時壓力最高。
- exponential backoff 拉開 retries，犧牲完成時間，換取 downstream recovery window。
- jitter 可避免大量 clients 同時在同一個 delay 後再次打回 downstream。

## Observation

查看 lab policy 摘要：

```bash
npm run lab:observe -- distributed-systems/timeout-retry
```

每次 `lab:run` 會產生：

```text
labs/distributed-systems/timeout-retry/runs/<run-id>/
├── metadata.json
└── output.log
```

產生 report：

```bash
npm run lab:report -- distributed-systems/timeout-retry
```

## Expected Result

這個 lab 應該讓你看到：

- Timeout 控制 caller 最長等待時間，但不等於 downstream operation 被取消。
- Retry 可以提升 transient failure 的成功率，但會增加 attempts。
- Backoff 降低 retry burst，代價是更長的 end-to-end latency。

## Trade-offs

| Strategy | 優點 | 代價 |
|---|---|---|
| No retry | latency 可預期、下游壓力最低 | transient failure 直接變成 user-visible failure |
| Immediate retry | 短暫錯誤恢復快時成功率高 | 容易在故障期間放大流量 |
| Exponential backoff | 給 downstream recovery window，降低同步重試 | caller 等待更久，需要 timeout / deadline 控制 |

## Production Considerations

- 設定 overall deadline，不只設定 per-attempt timeout。
- Retry 只應用在 retry-safe operation。
- 對非 idempotent side effect，先設計 idempotency key。
- 對持續故障的 dependency，retry 應搭配 circuit breaker、rate limit 或 backpressure。
- 記錄 attempt count、timeout count、downstream latency 與 final outcome。

## Cleanup

此 lab 沒有外部 infrastructure，也沒有 persistent state。

```bash
npm run lab:down -- distributed-systems/timeout-retry
```

## Promotion Candidate

目前不建議把 retry helper 抽到 `shared/` 或 `backend-forge-kit`。等 `idempotency`、`circuit-breaker`、`transactional-outbox` 等 labs 都驗證後，再整理穩定的 retry policy abstraction。
