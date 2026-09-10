# Learning Stages

本 roadmap 採取「先建立廣度，再逐步加深」的順序。Stage 不是 domain-by-domain 的瀑布式計畫；不應先把 Database 全部補到 L3 才開始 Distributed Systems、Messaging 或 Observability。

更適合的節奏是 level wave：

```text
Wave 0: 所有主要領域建立 L1 概念地圖
        ↓
Wave 1: 核心領域建立 L2 可執行 lab
        ↓
Wave 2: 選高價值主題推進 L3 failure / observability
        ↓
Wave 3: 少數主題整理 L4 architecture trade-off
```

## Wave 0: L1 全域概念地圖

所有主要領域至少到 L1，先理解全貌與彼此關係。

涵蓋領域：

- Database Engineering
- Distributed Systems
- Messaging / Event-driven Architecture
- SRE / Observability
- DevOps / Delivery
- Cloud Engineering
- Kubernetes
- Backend Security
- AI Engineering for Backend

完成條件：

- 知道這個技術解什麼問題。
- 知道它通常出現在系統哪一層。
- 知道為什麼需要它。
- 知道它與其他技術的關係。
- 能指出至少一個適合轉成 lab 的工程情境。

## Wave 1: L2 橫向可執行 Labs

目標是在多個重要 domain 都建立最小可執行 lab，而不是集中完成單一 domain。

建議先建立每個 domain 的 L2 baseline：

| Domain | L2 baseline lab 方向 |
|---|---|
| Database | transaction isolation、deadlock、indexing、connection pool |
| Distributed Systems | timeout retry、idempotency、circuit breaker |
| Messaging | Kafka basic、duplicate message、consumer group |
| Observability | structured logging、request metrics、basic tracing |
| DevOps | Docker image layers、CI quality gate |
| Cloud | AWS core service positioning、ECS/RDS minimal deployment design |
| Kubernetes | deployment、service、readiness/liveness |
| Security | JWT / RBAC / authorization decision |
| AI Backend | structured output、tool calling boundary |

完成條件：

- 每個優先 domain 至少有一個可被 runner 掃描的 lab。
- Lab 有 `README.md`、`lab.yaml`、runtime config 或 experiments。
- 能透過 `lab:info` 理解 problem、level、runtime 與 experiments。
- L2 lab 可以先重視可執行與可理解，不必急著加入完整 load、observability 或 production drill。

## Wave 2: L3 Failure / Observability 深化

當多個 domain 已經有 L2 接觸後，再選高價值主題推進到 L3。

L3 的重點不是新增更多工具，而是讓 lab 能重現真實操作問題：

- Failure case
- Load / concurrency
- Observable evidence
- Debug path
- Recovery or mitigation
- Trade-off comparison

優先深化方向：

| 主題 | 深化理由 |
|---|---|
| Database concurrency / lock / pool | Senior Backend 常見 production issue |
| Timeout / retry / idempotency | Distributed Systems 的可靠性核心 |
| Messaging delivery semantics | Event-driven system 的 correctness 核心 |
| Observability | 讓其他 L3 labs 有可觀察 evidence |
| Kubernetes probe / rollout failure | Deployment reliability 核心 |
| Cloud cleanup / IAM / health check | Production-like lab 的安全與可靠性底線 |

完成條件：

- Lab 可以刻意觸發失敗。
- Lab 能輸出足夠 evidence 讓人判斷發生什麼事。
- README 或 report 能說明 expected result、solution 與 trade-off。
- Destructive 或 billable resource cleanup 被明確記錄。

## Wave 3: L4 Selective Design

L4 只針對少數高價值主題進行，不要求每個 lab 都做到。

適合進 L4 的主題通常具備：

- 多種可行方案。
- 有明確 correctness / latency / throughput / cost / complexity trade-off。
- 已經有足夠 L2/L3 lab evidence。
- 可能形成 reusable pattern 或移到 `backend-forge-kit`。

候選方向：

- Idempotency strategy
- Transactional outbox
- Retry / backoff / circuit breaker policy
- Inventory consistency strategy
- Observability baseline
- Cloud deployment architecture
- Authorization model

完成條件：

- 能比較多個架構方案。
- 能說明選擇條件與不適用情境。
- 能整理成 architecture note、ADR 或 reusable pattern candidate。

## Planning Rule

Task backlog 應避免長時間只堆同一個 domain。除非有明確依賴，下一批任務應優先補齊 L1/L2 coverage，再回頭挑核心主題進 L3。
