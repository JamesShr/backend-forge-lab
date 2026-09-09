# Distributed Systems Labs

Distributed Systems labs 用來練習多 process / service / node 後才會出現的問題：partial failure、timeout、retry、idempotency、eventual consistency、distributed transaction 與 backpressure。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `distributed-systems/timeout-retry` | timeout、retry、exponential backoff、retry storm |
| 2 | `distributed-systems/idempotency` | duplicate request 下避免重複 business operation |
| 3 | `distributed-systems/transactional-outbox` | DB transaction 與 message publishing consistency |
| 4 | `distributed-systems/circuit-breaker` | dependency failure 下避免 cascading failure |
| 5 | `distributed-systems/backpressure` | producer/consumer throughput mismatch 與降載 |
| 6 | `distributed-systems/distributed-lock` | Redis lock 適用場景、lease、fencing token 限制 |
| 7 | `distributed-systems/saga` | distributed transaction compensation 與 failure recovery |

## 工具 / 框架操作練習

- NestJS service-to-service integration
- HTTP client timeout / retry policy
- Redis coordination primitives
- idempotency key store
- outbox table + relay worker
- failure injection scripts

## 建議整合情境

長期可用 `Order Service`、`Payment Service`、`Inventory Service` 串起來，逐步加入 duplicate request、payment timeout、retry、outbox 與 compensation。

## 設計原則

- 不把 retry/idempotency 當 isolated utility 寫，必須放進 business operation。
- 每個 lab 都要明確回答「失敗在哪裡、重試是否安全、一致性如何恢復」。
