# Learning Loop

每個主題固定走下面流程：

```text
Concept
   ↓
Minimal Example
   ↓
Integration
   ↓
Failure Scenario
   ↓
Observability
   ↓
Trade-off
   ↓
Documentation
```

## 範例：Kafka

| 階段 | 內容 |
|---|---|
| Concept | 理解 topic、partition、producer、consumer |
| Minimal Example | 建立 producer / consumer |
| Integration | Order service 發送 event 給 notification service |
| Failure Scenario | Consumer crash 或 duplicate event |
| Observability | 觀察 consumer lag |
| Trade-off | 比較 Kafka、queue、REST 的適用情境 |
| Documentation | 整理 architecture decision 與 lab observation |

## 學習紀錄格式

每個主題可以固定記錄：

```text
# Problem

# Concept

# Implementation

# Failure Case

# Trade-off

# Production Notes

# Lab

# Current Level
```

這個格式讓學習成果能從 L1 持續推進到 L3，而不是停在工具操作筆記。
