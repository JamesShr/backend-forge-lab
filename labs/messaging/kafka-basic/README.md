# Lab: Kafka Basic

## Problem

Producer 發送 message 到 topic 後，Kafka 如何透過 topic、partition、consumer group 與 offset 讓 consumer 可重複、可觀察地讀取訊息？

## Learning Goal

這個 lab 對應 Messaging L2 baseline：

- Topic
- Partition
- Producer
- Consumer
- Consumer group
- Offset
- Replay from beginning

## Level

目前狀態：L2 active。

目標狀態：先建立 Kafka 最小可執行情境，再逐步深化到 L3，加入 duplicate message、consumer crash、poison message、retry topic、DLQ 與 consumer lag。

## Background

Kafka 不是單純的 queue。Producer 把 record 寫入 topic，topic 由 partitions 組成。Consumer group 讀取 partitions 並提交 offset，因此同一批 records 可以被不同 group 重新讀取，也可以讓同一 group 從已提交 offset 往後繼續。

這個 lab 先建立可觀察 baseline，避免一開始就跳到 exactly-once、transactional producer 或 retry/DLQ。後續 labs 會在這個基礎上刻意製造 failure。

## Architecture

此 lab 使用 Docker Compose 啟動單節點 Kafka KRaft runtime：

```text
producer experiment
  -> Kafka topic
  -> partitions
  -> consumer / consumer group
  -> offset observation
```

Experiment scripts 不引入 Kafka npm client。第一版直接透過 Kafka container 內建 CLI 執行：

- `kafka-topics.sh`
- `kafka-console-producer.sh`
- `kafka-console-consumer.sh`
- `kafka-consumer-groups.sh`

這讓 lab 的 dependency surface 維持很小，也讓觀察輸出更接近 Kafka 原生概念。

## Setup

啟動 Kafka 並建立 baseline topics：

```bash
npm run lab:up -- messaging/kafka-basic
```

查看 lab metadata：

```bash
npm run lab:info -- messaging/kafka-basic
```

## Experiments

### produce-consume

```bash
npm run lab:run -- messaging/kafka-basic produce-consume
```

觀察重點：

- Topic 需要先被明確建立。
- Producer 寫入 record 後，consumer 可以從 beginning 讀取。
- Record key 與 value 是不同欄位；key 後續會影響 partition placement。

### partitioning

```bash
npm run lab:run -- messaging/kafka-basic partitioning
```

觀察重點：

- Topic 有多個 partitions。
- 相同 key 的 records 會穩定落在同一個 partition。
- 不同 key 可能分散到不同 partitions，這是 Kafka scale-out 與 ordering boundary 的基礎。

### consumer-offset

```bash
npm run lab:run -- messaging/kafka-basic consumer-offset
```

觀察重點：

- Consumer group 讀取後會提交 offset。
- 同一 group 再次讀取時，會從已提交 offset 往後繼續。
- 新 group 可以從 beginning replay 同一個 topic。

## Observation

查看 topics、consumer groups 與觀察提示：

```bash
npm run lab:observe -- messaging/kafka-basic
```

每次 `lab:run` 會產生：

```text
labs/messaging/kafka-basic/runs/<run-id>/
├── metadata.json
└── output.log
```

產生 report：

```bash
npm run lab:report -- messaging/kafka-basic
```

## Expected Result

這個 lab 應該讓你看到：

- Kafka record 被 append 到 topic partition，而不是直接送到某個 consumer。
- Partition 是 ordering 與 parallelism 的基本邊界。
- Consumer group offset 決定同一 group 下一次從哪裡繼續讀。
- Replay 是用新的 group 或 reset offset 來達成，而不是要求 producer 重送。

## Trade-offs

| Design | 優點 | 代價 |
|---|---|---|
| Single broker | 最小 local runtime，容易清理 | 不呈現 replication、broker failure 或 ISR 行為 |
| Kafka CLI experiments | dependency 少，觀察接近 Kafka 原生概念 | 不呈現 application client SDK 的錯誤處理細節 |
| Explicit topics | 行為可重現，避免 auto-create topic 隱性狀態 | 每個 experiment 需要 reset topic |

## Production Considerations

- Production Kafka 通常需要多 broker、replication factor、monitoring 與 capacity planning。
- Partition key 是 ordering 與 hot partition trade-off 的核心設計點。
- Consumer group offset 是 delivery semantics 的重要邊界；consumer crash 和 duplicate delivery 會在後續 labs 深化。
- Auto-create topics 在 production 常會關閉，topic 應由 deployment 或 provisioning 流程管理。
- Message schema、compatibility 與 dead-letter strategy 不應等到 production incident 才補。

## Cleanup

停止 Kafka：

```bash
npm run lab:down -- messaging/kafka-basic
```

刪除 Kafka volume 與所有 topic data：

```bash
npm run lab:destroy -- messaging/kafka-basic --yes
```

## Promotion Candidate

目前不建議把 Kafka CLI helper 抽到 `shared/`。等 `kafka-duplicate-message`、`kafka-consumer-lag` 與 retry/DLQ labs 都驗證後，再整理穩定的 messaging runtime helper。
