# Messaging Labs

Messaging labs 用來理解 queue / pub-sub / Kafka 在 delivery semantics、ordering、consumer group、retry、DLQ、schema evolution 與 consumer lag 上的 production 行為。

## 目前已實作

| Lab | Level | 重點 |
|---|---:|---|
| `messaging/kafka-basic` | L2 -> L3 | topic、partition、producer、consumer group、offset |

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `messaging/kafka-duplicate-message` | at-least-once delivery 與 idempotent consumer |
| 2 | `messaging/kafka-ordering` | partition key、ordering limitation、out-of-order handling |
| 3 | `messaging/kafka-retry` | retry topic、backoff、poison message 隔離 |
| 4 | `messaging/kafka-dlq` | DLQ decision、reprocess、audit |
| 5 | `messaging/kafka-consumer-lag` | consumer lag observation、slow consumer、backpressure |
| 6 | `messaging/schema-evolution` | event contract compatibility 與 breaking change |
| 7 | `messaging/cdc-outbox` | CDC 與 outbox relay 對照 |

## 工具 / 框架操作練習

- Kafka Docker Compose runtime
- producer / consumer scripts
- consumer group scaling
- offset commit / redelivery
- Kafka UI 或 CLI inspection
- schema registry 評估

## 建議整合情境

以 `Order -> Payment -> Inventory -> Notification` event flow 為主線，刻意製造 duplicate message、consumer crash、retry storm、DLQ 與 consumer lag。

## 設計原則

- 先觀察 delivery 行為，再討論 exactly-once 或 transactional messaging。
- 每個 experiment 要留下 input event、consumer outcome 與 offset / lag observation。
