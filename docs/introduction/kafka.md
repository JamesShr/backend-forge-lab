# Kafka Introduction

## Why This Exists

這份文件不是 Kafka 完整教學，也不是 production Kafka handbook。

它的目的很小：讓你在跑 Backend Forge Lab 的 Kafka / messaging labs 前，先有足夠的 mental model，知道自己正在觀察什麼。

目前主要支援：

- `messaging/kafka-basic`
- 後續 `messaging/kafka-duplicate-message`
- 後續 `messaging/kafka-consumer-lag`
- 後續 retry / DLQ / schema evolution labs

如果某個概念暫時不會影響 lab observation，這份 introduction 會先略過。

## Mental Model

Kafka 可以先想成一組可持久化的 append-only logs。

Producer 不直接把 message 交給某個 consumer。Producer 把 record append 到 topic 的 partition。Consumer 再依照自己的 consumer group offset 去讀取這些 records。

```text
producer
  -> topic
     -> partition 0: record 0, record 1, record 2
     -> partition 1: record 0, record 1
     -> partition 2: record 0
  -> consumer group reads records and commits offsets
```

這個 mental model 很重要，因為它解釋了幾件事：

- Message 被寫進 Kafka 後，不是被某個 consumer 立刻「拿走」。
- 不同 consumer group 可以讀同一份 topic data。
- Consumer group 的 offset 決定它下一次從哪裡繼續。
- Replay 通常是從 offset 或新的 consumer group 開始，而不是要求 producer 重送。
- Ordering 的基本邊界是 partition，不是整個 topic。

## Core Concepts

### Record

Record 是 Kafka 裡被寫入 topic 的單位。

常見欄位：

| 欄位 | 說明 |
|---|---|
| key | 可選；常用來決定 partition placement |
| value | message payload，例如 JSON event |
| timestamp | Kafka 或 producer 記錄的時間 |
| headers | 可選 metadata |
| offset | record 在 partition 內的位置 |

在 lab 裡，record 通常長這樣：

```text
key   = order-1001
value = {"event":"OrderCreated","orderId":"order-1001"}
```

### Topic

Topic 是 records 的邏輯分類。

例如：

```text
orders.events
payments.events
inventory.events
```

在這個 repo 的 lab 裡，topic 會用明確名稱，例如：

```text
lab.kafka-basic.produce-consume
lab.kafka-basic.partitioning
lab.kafka-basic.consumer-offset
```

這讓每個 experiment 的資料邊界清楚，避免不同實驗互相污染。

### Partition

Topic 由多個 partitions 組成。

Partition 是 Kafka 裡非常重要的邊界：

- Record 實際 append 到 partition。
- Offset 是 partition 內的位置。
- Ordering 只保證在同一個 partition 內。
- 多 partitions 讓 topic 可以 parallel consume。

如果一個 topic 有 3 個 partitions，可以想成：

```text
topic: orders.events
  partition 0: offset 0, 1, 2, 3
  partition 1: offset 0, 1
  partition 2: offset 0, 1, 2
```

不要把 topic 想成一條全域有序的 queue。比較準確的想法是：topic 是多條 partition logs 的集合。

### Offset

Offset 是 record 在某個 partition 裡的位置。

Offset 只在 partition 內有意義：

```text
partition 0 offset 3
partition 1 offset 3
```

這兩個 offset 都叫 3，但它們屬於不同 partition，不是同一個全域位置。

Consumer group 會提交它已經讀到哪個 offset。這個 committed offset 是 Kafka delivery behavior 的核心觀察點。

### Producer

Producer 負責把 record 寫入 topic。

Producer 決定：

- 要寫到哪個 topic。
- Record key 是什麼。
- Record value 是什麼。

Kafka 根據 record key 和 partitioner 決定 record 進入哪個 partition。這就是為什麼 key selection 會影響 ordering 和 load distribution。

### Consumer

Consumer 負責從 topic partitions 讀 records。

Consumer 可以：

- 從 beginning 讀。
- 從 consumer group 已提交 offset 往後讀。
- 讀一批後提交 offset。

在 lab 裡，consumer 行為主要透過 Kafka CLI 觀察，不先引入 application SDK。

### Consumer Group

Consumer group 是 Kafka 用來追蹤 consumption progress 的單位。

同一個 group 裡的 consumers 會分攤 partitions。同一個 topic 可以被多個 group 獨立讀取。

例如：

```text
topic: orders.events

consumer group: payment-service
  reads orders and charges payment

consumer group: notification-service
  reads the same orders and sends email
```

這兩個 group 互不影響，因為它們有各自的 offsets。

這也是 Kafka 和傳統 queue 很不一樣的地方：同一份 topic records 可以服務多個 downstream use cases。

## Key Ideas For Labs

### Kafka Is Not Just A Queue

傳統 queue 常見直覺是：

```text
producer -> queue -> consumer receives and removes message
```

Kafka 更接近：

```text
producer -> append to partition log
consumer group -> tracks its own read position
```

Record 不會因為某個 consumer 讀過就立刻從 topic 消失。它會依 Kafka retention policy 保留一段時間或一定大小。

### Replay Is A First-Class Behavior

因為 Kafka 保存 log，consumer 可以 replay。

常見 replay 方式：

- 使用新的 consumer group 從 beginning 讀。
- Reset 既有 consumer group offset。

在 `messaging/kafka-basic` 裡，`consumer-offset` experiment 會展示：

- 同一 group 第二次讀取時，從已提交 offset 繼續。
- 新 group 可以 replay 同一個 topic。

### Partition Key Defines Ordering Boundary

如果 record 有 key，Kafka 會用 key 決定 partition placement。

同一 key 通常會落到同一 partition，因此可以保留該 key 相關事件的順序。

例如：

```text
key = order-1001
  OrderCreated
  PaymentAuthorized
  InventoryReserved
```

這些事件若都用同一 key，通常會落在同一 partition，consumer 可以看到這個 key 的順序。

但不同 key 之間沒有全域順序保證。

### Offset Commit Is Part Of Delivery Semantics

Consumer 讀到 message 不等於系統已經安全完成處理。

重要問題是：

```text
consumer 什麼時候 commit offset？
```

如果 consumer 在處理完 business side effect 前就 commit offset，crash 後可能漏處理。

如果 consumer 處理完 side effect 後、commit offset 前 crash，重啟後可能重複處理。

這就是後續 `messaging/kafka-duplicate-message` 會討論 at-least-once delivery 和 idempotent consumer 的原因。

## How This Repo Uses Kafka

目前 `messaging/kafka-basic` 使用 Docker Compose 啟動單節點 Kafka KRaft runtime。

```text
labs/messaging/kafka-basic/
├── docker-compose.yml
├── lab.yaml
└── experiments/
```

這個 lab 刻意先不做：

- 多 broker cluster
- replication failure
- schema registry
- Kafka UI
- Kafka application SDK
- exactly-once semantics
- retry topic / DLQ

第一版只建立最小可觀察面：

- topic
- partition
- producer
- consumer
- consumer group
- offset

Experiment scripts 透過 Kafka container 內建 CLI 操作 Kafka：

| CLI | 用途 |
|---|---|
| `kafka-topics.sh` | 建立、刪除、列出、describe topics |
| `kafka-console-producer.sh` | 寫入 test records |
| `kafka-console-consumer.sh` | 讀取 test records |
| `kafka-consumer-groups.sh` | 觀察 consumer group offsets |

## Basic Commands In This Repo

啟動 Kafka lab：

```bash
npm run lab:up -- messaging/kafka-basic
```

查看目前 topics 和 consumer groups：

```bash
npm run lab:observe -- messaging/kafka-basic
```

執行 producer / consumer baseline：

```bash
npm run lab:run -- messaging/kafka-basic produce-consume
```

觀察 partition key：

```bash
npm run lab:run -- messaging/kafka-basic partitioning
```

觀察 consumer group offset：

```bash
npm run lab:run -- messaging/kafka-basic consumer-offset
```

停止 container：

```bash
npm run lab:down -- messaging/kafka-basic
```

完全刪除 Kafka volume 和 topic data：

```bash
npm run lab:destroy -- messaging/kafka-basic --yes
```

## What To Observe In Labs

跑 Kafka labs 時，不只看 command 有沒有成功。更重要的是觀察 evidence。

### Topic Details

觀察：

```text
PartitionCount
ReplicationFactor
Partition
Leader
Replicas
Isr
```

在 `kafka-basic` 裡 replication factor 是 1，因為這是 local single-broker baseline。

### Consumed Records

觀察：

```text
key:value
```

或帶 metadata：

```text
Partition:0:Offset:1:key:value
```

這能回答：

- 哪些 records 被寫入？
- Consumer 是否讀到預期 records？
- Records 分別落在哪些 partitions？
- 同 key 是否維持在同 partition？

### Consumer Group Offset

觀察：

```text
GROUP
TOPIC
PARTITION
CURRENT-OFFSET
LOG-END-OFFSET
LAG
```

這能回答：

- Consumer group 目前讀到哪裡？
- Topic 還有多少 records 沒被該 group 消費？
- 新 group 和舊 group 的 progress 是否互相獨立？

## Common Confusions

### Topic 和 Queue 一樣嗎？

不完全一樣。

Topic 比較像多條 append-only logs 的集合。Consumer group 用 offset 追蹤自己的讀取進度。

### Message 被 consumer 讀完後會消失嗎？

不會因為某個 consumer 讀取就消失。

Kafka record 會依 retention policy 保留。Consumer group offset 只表示某個 group 的讀取進度。

### Offset 是全域序號嗎？

不是。

Offset 是 partition 內的序號。不同 partitions 可以有相同 offset number。

### Partition 越多越好嗎？

不一定。

更多 partitions 可以提高 parallelism，但也增加 rebalancing、metadata、ordering boundary 和 operational complexity。對 lab 來說，3 partitions 足夠觀察 key distribution。

### Consumer group 和 consumer 是一樣的嗎？

不一樣。

Consumer 是實際讀資料的 process。Consumer group 是一組 consumers 的共同身份和 offset boundary。

### 為什麼同一 topic 可以被多個服務讀？

因為不同 consumer groups 有各自 offsets。

例如 payment service 和 notification service 可以讀同一個 `orders.events` topic，但它們的 progress 不互相影響。

## Related Labs

目前：

- `messaging/kafka-basic`

適合後續延伸：

- `messaging/kafka-duplicate-message`: consumer crash、at-least-once delivery、idempotent consumer
- `messaging/kafka-consumer-lag`: slow consumer、lag observation、backpressure
- `messaging/kafka-retry`: retry topic、backoff、poison message isolation
- `messaging/kafka-dlq`: dead-letter queue、reprocess、audit
- `messaging/schema-evolution`: event contract compatibility

## Boundary

這份 introduction 只回答「跑 lab 前要懂什麼」。

更深入的主題應留給專門的 lab 或 handbook，例如：

- Kafka cluster sizing
- replication 與 ISR failure
- broker upgrade
- security / ACL
- schema registry governance
- exactly-once semantics
- Kafka Streams
- cross-region replication
