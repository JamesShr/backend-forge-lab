# Lab Authoring Rules

本文件記錄新增或修改 lab 時的基本規則。

## Rule 1: 先定義工程問題

不要因為 roadmap 出現某個技術，就立刻建立 lab。

必須先定義：

```text
What engineering problem are we trying to reproduce?
```

## Rule 2: 一個 lab 聚焦一個主要問題

避免：

```text
kafka-complete-demo
```

偏好：

```text
kafka-duplicate-message
kafka-ordering
kafka-consumer-lag
```

## Rule 3: 優先使用最小 infrastructure

例如研究 PostgreSQL deadlock，不要同時加入 Kafka、Redis、Kubernetes、Grafana，除非實驗真的需要。

## Rule 4: 深度依 level 推進

| Level | 重點 |
|---|---|
| L1 | Explain / minimal demo |
| L2 | Implement / runnable scenario |
| L3 | Failure、load、observability |
| L4 | Architecture trade-off |

## Rule 5: 不要過早抽象

Lab 中的 code 可以 explicit、experimental、scenario-specific。只有在多個 labs 驗證後，才考慮抽成 shared 或升格到 `backend-forge-kit`。

## Rule 6: 每個 lab README 應回答固定問題

建議包含：

```text
Problem
Learning Goal
Level
Background
Architecture
Scenario
Setup
Experiment
Failure Injection
Observation
Expected Result
Solution
Trade-offs
Production Considerations
Cleanup
Promotion Candidate
```
