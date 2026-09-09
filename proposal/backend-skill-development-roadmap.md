# Backend Skill Development Roadmap

> 目標：建立一套以 **Senior Backend Engineer** 為核心，延伸到 Distributed Systems、Database Engineering、DevOps、SRE、Cloud、Security 與 AI Engineering 的長期學習計畫。
>
> 本文件不是一次把所有技術學到最深，而是採取「先建立廣度，再逐步加深」的策略，透過 L1 → L4 分級，讓每個領域都有清楚的學習終點與實作標準。

---

# 1. 學習計畫核心理念

這份計畫的重點不是把工具一個個學完，而是建立「能處理哪些工程問題」的能力模型。

例如：

- 不把 Redis 當成單一技能，而是放進 Cache、Distributed Lock、Rate Limiting、Messaging 等情境中理解。
- 不把 Kafka 當成單純 Queue，而是理解 Event-driven Architecture、Delivery Semantics、Ordering、Retry、DLQ、Backpressure 等問題。
- 不把 Kubernetes 當成 YAML 操作，而是理解 Deployment、Health Check、Scaling、Resource Management、Availability 與 Production Troubleshooting。
- 不把 AWS 當成服務清單，而是透過實際部署 Backend 系統來理解 Compute、Network、Database、IAM、Observability 與 Reliability。

整體學習方式採用：

```text
第一輪：重要領域全部建立 L1 認知
        ↓
第二輪：核心領域進入 L2 實作
        ↓
第三輪：透過 Production-like Lab 推進到 L3
        ↓
第四輪：依職涯方向與實務需求，選擇少數領域進入 L4
```

---

# 2. L1–L4 能力定義

| 等級 | 名稱 | 核心目標 | 能力判定 |
|---|---|---|---|
| L1 | Understand | 建立概念地圖 | 知道它解什麼問題、核心術語、基本運作方式 |
| L2 | Implement | 能獨立實作 | 能完成小型案例、基本設定與常見整合 |
| L3 | Operate | 能處理真實問題 | 能 debug、處理 failure case、效能與 reliability 問題 |
| L4 | Design | 能進行架構設計 | 能根據需求做 trade-off、capacity、HA、scalability 與 architecture decision |

> 對 Senior Backend Engineer 而言，不是所有領域都需要 L4。核心能力通常要求 L3～L4；周邊能力維持 L2～L3 即可。

---

# 3. 本次學習計畫領域

本計畫主要拆成以下十個領域。

## 3.1 Backend Engineering

建立穩固的 API、Application Architecture、Testing、Error Handling、Documentation 與 Maintainability 能力。

重點不是熟悉 NestJS API 語法，而是理解如何建立可維護、可測試、可演進的 Backend System。

---

## 3.2 Database Engineering

從「會 SQL / ORM」提升到能理解 Transaction、Lock、Index、Query Planning、Replication、Partition 與 Database Reliability。

目標是讓 Database 不再只是 Storage，而是系統設計的一部分。

---

## 3.3 Distributed Systems

理解系統被拆成多個 Process、Service、Node 後產生的問題，包括：

- Partial Failure
- Consistency
- Retry
- Idempotency
- Eventual Consistency
- Distributed Transaction
- Messaging
- Event-driven Architecture
- Scalability
- Availability

微服務只是 Distributed Systems 的一種實作型態；真正需要學的是分散式環境下如何處理失敗與一致性。

---

## 3.4 Messaging & Event-driven Architecture

深入理解 Queue、Pub/Sub、Kafka、Consumer Group、Partition、Ordering、Retry、DLQ、Backpressure 與 Transactional Messaging。

此領域會與 Distributed Systems 高度交叉，但保留獨立學習區塊，方便進行 Kafka 等工具實作。

---

## 3.5 DevOps & Delivery

建立從 Source Code 到 Production Deployment 的完整流程能力。

涵蓋：

- Docker
- CI/CD
- Artifact
- Container Registry
- Environment / Secret
- Deployment Strategy
- Infrastructure as Code
- GitOps

---

## 3.6 Cloud Engineering

以 Backend Engineer 的角度學 Cloud，不追求熟悉所有服務，而是掌握 Production Backend 常見元件：

- Compute
- Network
- Database
- Cache
- Storage
- Messaging
- IAM
- Observability

實作上建議 AWS 為主修，既有 Azure 經驗作為補充。

---

## 3.7 Kubernetes & Container Orchestration

理解如何讓多個 Backend Workload 能可靠地部署、擴展、復原與更新。

學習重點會從「kubectl 能操作」逐步提升到：

- Probe
- Resource Management
- Rolling Update
- HPA
- Scheduling
- Networking
- Storage
- Troubleshooting

---

## 3.8 SRE & Observability

學習如何知道系統「是否健康」，以及服務出現 Production Incident 時怎麼定位與處理。

核心內容：

- Metrics
- Logs
- Traces
- OpenTelemetry
- Prometheus
- Grafana
- SLI / SLO / SLA
- Alert
- Incident
- RCA
- Capacity Planning

---

## 3.9 Backend Security

建立 Backend Engineer 必要的 Security Engineering 基礎，包括：

- Authentication
- Authorization
- OAuth2 / OIDC
- RBAC / ABAC
- Session / Token
- TLS
- Secret Management
- OWASP
- IAM
- Audit Log
- Multi-tenant Security

---

## 3.10 AI Engineering for Backend

不以轉職 ML Engineer 為目標，而是讓 Backend Engineer 能設計與維護 AI Application Backend。

包含：

- LLM API
- Structured Output
- Tool Calling
- RAG
- Vector Database
- Agent
- MCP
- Evaluation
- Guardrail
- Token / Cost Management
- AI-assisted Software Engineering

---

# 4. 技能重點矩陣

星等定義：

- ★★★★★：Senior Backend 核心能力，應優先投入
- ★★★★☆：高價值能力，建議至少達 L2～L3
- ★★★☆☆：重要周邊能力，依需求深入
- ★★☆☆☆：知道概念即可，進階視職涯方向
- ★☆☆☆☆：特定情境才需要

---

## 4.1 Backend Engineering

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| REST API Design | ★★★★★ | L3 | Resource、Versioning、Error、Pagination、Idempotency |
| Application Architecture | ★★★★★ | L3-L4 | Layering、Module Boundary、Dependency Direction |
| Validation / Error Handling | ★★★★★ | L3 | 統一驗證、錯誤模型、Domain Error |
| Testing Strategy | ★★★★★ | L3 | Unit / Integration / E2E / Contract Test |
| Authentication Integration | ★★★★★ | L3 | Session、Token、OAuth/OIDC 整合 |
| gRPC / RPC | ★★★★☆ | L2-L3 | Service-to-service communication |
| API Documentation | ★★★★☆ | L2-L3 | OpenAPI、contract、version change |
| Clean Code / Maintainability | ★★★★☆ | L3 | Readability、complexity、refactoring |
| Design Patterns | ★★★☆☆ | L2-L3 | 使用情境優先，不追求背 pattern |
| GraphQL | ★★☆☆☆ | L1-L2 | 視產品情境需要 |

---

## 4.2 Database Engineering

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Relational Modeling | ★★★★★ | L3 | PK / FK / Constraint / Normalization |
| Transaction / ACID | ★★★★★ | L3 | Transaction boundary 與 consistency |
| Isolation Level | ★★★★★ | L3 | Dirty / Non-repeatable / Phantom Read |
| Locking | ★★★★★ | L3 | Row Lock、Optimistic / Pessimistic Lock |
| Index | ★★★★★ | L3 | Single / Composite / Selectivity |
| EXPLAIN / Query Plan | ★★★★★ | L3 | SQL 效能分析核心能力 |
| Connection Pool | ★★★★☆ | L3 | Pool sizing、timeout、exhaustion |
| Deadlock | ★★★★☆ | L3 | Detection、avoidance、retry |
| Migration | ★★★★☆ | L3 | Schema evolution、zero/minimal downtime |
| Partitioning | ★★★★☆ | L2-L3 | 大量資料管理 |
| Replication / Read Replica | ★★★★☆ | L2-L3 | Read scaling、HA |
| Backup / Restore / PITR | ★★★★☆ | L2-L3 | Production reliability |
| Vacuum / PostgreSQL Internals | ★★★☆☆ | L2-L3 | PostgreSQL 特有維運 |
| Sharding | ★★★☆☆ | L3-L4 | 大規模系統再深入 |

---

## 4.3 Distributed Systems

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Partial Failure | ★★★★★ | L2-L3 | 分散式系統核心問題 |
| Timeout | ★★★★★ | L2-L3 | 避免 request 無限等待 |
| Retry | ★★★★★ | L3 | Retry policy、backoff、retry storm |
| Idempotency | ★★★★★ | L3 | API / Message 重複執行保護 |
| Eventual Consistency | ★★★★★ | L3 | Distributed data consistency |
| Circuit Breaker | ★★★★☆ | L2-L3 | 防 cascading failure |
| Backpressure | ★★★★☆ | L3 | Producer / Consumer throughput 控制 |
| Distributed Lock | ★★★★☆ | L2-L3 | Coordination，但需理解適用限制 |
| Saga | ★★★★☆ | L3 | Distributed transaction compensation |
| Outbox Pattern | ★★★★★ | L3 | DB transaction 與 messaging consistency |
| CAP | ★★★★☆ | L2 | 理解 trade-off，而非背定義 |
| Service Discovery | ★★★☆☆ | L2 | Microservice runtime 基礎 |
| Leader Election | ★★☆☆☆ | L3-L4 | 特定 distributed coordination 情境 |
| Consensus / Raft / Paxos | ★★☆☆☆ | L4 | 進階分散式理論 |

---

## 4.4 Messaging & Event-driven Architecture

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Queue vs Pub/Sub | ★★★★★ | L2 | 基本 messaging model |
| Kafka Fundamentals | ★★★★★ | L2 | Topic / Partition / Producer / Consumer |
| Consumer Group | ★★★★★ | L3 | Parallelism 與 scale-out |
| Ordering | ★★★★★ | L3 | Partition ordering limitation |
| Delivery Semantics | ★★★★★ | L3 | At-most / At-least / Exactly-once |
| Retry | ★★★★★ | L3 | Consumer retry strategy |
| Dead Letter Queue | ★★★★☆ | L2-L3 | Failed message isolation |
| Consumer Lag | ★★★★☆ | L3 | Production observability |
| Backpressure | ★★★★☆ | L3 | Throughput mismatch |
| Schema Evolution | ★★★★☆ | L3 | Event contract compatibility |
| CDC | ★★★☆☆ | L2-L3 | DB change stream |
| Stream Processing | ★★★☆☆ | L2-L3 | Kafka Streams / Flink 概念 |

---

## 4.5 DevOps & Delivery

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Linux Fundamentals | ★★★★★ | L2-L3 | Process、Network、Disk、Permission |
| Docker | ★★★★★ | L3 | Image、Layer、Network、Volume、Runtime |
| Docker Compose | ★★★★☆ | L2 | Local environment orchestration |
| CI | ★★★★★ | L3 | Test、Build、Quality Gate |
| CD | ★★★★★ | L3 | Deploy、Rollback、Promotion |
| Container Registry | ★★★★☆ | L2 | ECR / GHCR 等 |
| Environment Management | ★★★★★ | L3 | Dev / Stage / Prod |
| Secret Management | ★★★★★ | L3 | Secret injection / rotation |
| Deployment Strategy | ★★★★☆ | L3 | Rolling / Blue-Green / Canary |
| Terraform | ★★★★☆ | L2-L3 | IaC 核心技能 |
| GitOps | ★★★☆☆ | L2-L3 | ArgoCD 等 |
| Artifact / SBOM | ★★★☆☆ | L2-L3 | Supply chain / release management |

---

## 4.6 Cloud Engineering

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Cloud Shared Responsibility | ★★★★☆ | L1 | Cloud 基本責任模型 |
| IAM | ★★★★★ | L3 | User / Role / Policy / Least Privilege |
| VPC / Subnet | ★★★★★ | L2-L3 | Backend production network 基礎 |
| Security Group | ★★★★★ | L2-L3 | Network access control |
| Load Balancer | ★★★★★ | L2-L3 | ALB / target / health check |
| Compute | ★★★★★ | L2 | EC2 / ECS / EKS 基本定位 |
| RDS | ★★★★★ | L2-L3 | Managed relational DB |
| ElastiCache | ★★★★☆ | L2 | Managed Redis |
| S3 | ★★★★☆ | L2 | Object storage |
| SQS / SNS | ★★★★☆ | L2-L3 | Cloud messaging |
| Route53 / DNS | ★★★★☆ | L2 | Domain / routing |
| ACM / TLS | ★★★★☆ | L2 | Certificate management |
| CloudWatch | ★★★★★ | L2-L3 | Metrics / Logs / Alarm |
| Multi-AZ | ★★★★☆ | L3 | Availability |
| Autoscaling | ★★★★☆ | L3 | Elastic workload |
| Cost Management | ★★★☆☆ | L2-L3 | Budget / resource cost |
| Multi-region | ★★☆☆☆ | L4 | Advanced availability |

---

## 4.7 Kubernetes

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Pod | ★★★★★ | L1-L2 | 最小 workload unit |
| Deployment | ★★★★★ | L2 | Replica / rollout |
| Service | ★★★★★ | L2 | Service discovery / network |
| Ingress | ★★★★☆ | L2 | External routing |
| ConfigMap / Secret | ★★★★☆ | L2 | Runtime configuration |
| PVC | ★★★☆☆ | L2 | Persistent storage |
| Liveness / Readiness Probe | ★★★★★ | L3 | Production reliability |
| Resource Request / Limit | ★★★★★ | L3 | Scheduling / resource control |
| Rolling Update / Rollback | ★★★★★ | L3 | Deployment lifecycle |
| HPA | ★★★★☆ | L2-L3 | Horizontal scaling |
| Helm | ★★★★☆ | L2-L3 | Package / environment management |
| PDB | ★★★☆☆ | L3 | Availability during disruption |
| Affinity / Taint | ★★★☆☆ | L3 | Scheduling control |
| NetworkPolicy | ★★★☆☆ | L3 | Cluster network security |
| Troubleshooting | ★★★★★ | L3 | Logs、Events、Probe、Resource、Network |
| Operator | ★★☆☆☆ | L4 | Advanced automation |
| Service Mesh | ★★☆☆☆ | L3-L4 | Advanced traffic / security |

---

## 4.8 SRE & Observability

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Structured Logging | ★★★★★ | L3 | Searchable / contextual logs |
| Metrics | ★★★★★ | L3 | System health 基礎 |
| Tracing | ★★★★★ | L3 | Distributed request tracing |
| OpenTelemetry | ★★★★★ | L2-L3 | Unified telemetry instrumentation |
| Prometheus | ★★★★★ | L2-L3 | Metrics collection |
| Grafana | ★★★★☆ | L2 | Dashboard / alert visualization |
| p50 / p95 / p99 | ★★★★★ | L2-L3 | Latency interpretation |
| Throughput / Error Rate | ★★★★★ | L3 | Golden signals |
| SLI | ★★★★☆ | L3 | Reliability indicator |
| SLO | ★★★★☆ | L3 | Reliability objective |
| SLA | ★★★☆☆ | L2 | External service commitment |
| Alerting | ★★★★☆ | L3 | Actionable alert design |
| Incident Response | ★★★★☆ | L3 | Production incident workflow |
| RCA / Postmortem | ★★★★☆ | L3 | Failure learning |
| Runbook | ★★★★☆ | L2-L3 | Operational procedure |
| Load Testing | ★★★★★ | L3 | Capacity / bottleneck |
| Capacity Planning | ★★★★☆ | L3-L4 | Production sizing |
| Chaos Engineering | ★★☆☆☆ | L4 | Advanced resilience testing |

---

## 4.9 Backend Security

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| Authentication | ★★★★★ | L3 | Identity verification |
| Authorization | ★★★★★ | L3 | Access decision |
| Session / Cookie / Token | ★★★★★ | L3 | State / credential mechanism |
| JWT | ★★★★☆ | L2-L3 | Token use / limitation |
| OAuth2 | ★★★★★ | L3 | Delegated authorization |
| OIDC | ★★★★★ | L3 | Identity layer |
| RBAC | ★★★★★ | L3 | Role-based access |
| ABAC | ★★★☆☆ | L2-L3 | Attribute-based access |
| TLS | ★★★★★ | L2-L3 | Transport security |
| Password Hashing | ★★★★★ | L2 | Secure credential storage |
| Secret Management | ★★★★★ | L3 | Key / secret lifecycle |
| OWASP API Security | ★★★★★ | L3 | Common backend vulnerabilities |
| Rate Limiting | ★★★★☆ | L2-L3 | Abuse / overload control |
| Audit Log | ★★★★☆ | L3 | Traceability |
| Multi-tenant Authorization | ★★★★☆ | L3 | Tenant isolation |
| Threat Modeling | ★★★☆☆ | L3 | Security design thinking |
| Zero Trust | ★★☆☆☆ | L3-L4 | Advanced enterprise architecture |

---

## 4.10 AI Engineering for Backend

| 項目 | 重要度 | 建議階段 | 說明 |
|---|---:|---:|---|
| LLM API Integration | ★★★★☆ | L2 | Backend AI 基本能力 |
| Prompt / Context | ★★★★☆ | L2-L3 | Input design / context management |
| Structured Output | ★★★★☆ | L2 | Schema-constrained response |
| Streaming | ★★★★☆ | L2 | Token streaming / realtime UX |
| Tool Calling | ★★★★☆ | L2-L3 | LLM 與 backend capability 整合 |
| Embedding | ★★★☆☆ | L2 | Semantic representation |
| Vector Database | ★★★☆☆ | L2 | Retrieval storage |
| RAG | ★★★★☆ | L2-L3 | Retrieval augmented generation |
| Agent Workflow | ★★★★☆ | L2-L3 | Multi-step AI execution |
| MCP | ★★★☆☆ | L2 | Tool / context interoperability |
| Evaluation | ★★★★☆ | L3 | Quality / regression verification |
| Guardrail | ★★★★☆ | L3 | Output / action safety |
| Token / Cost Management | ★★★☆☆ | L2-L3 | Production cost |
| LLM Observability | ★★★☆☆ | L3 | Latency / quality / cost tracking |
| AI Coding Agent | ★★★★☆ | L2-L3 | Agent-assisted development |
| Spec-driven Development | ★★★★☆ | L2-L3 | AI 開發流程控制 |
| Self-hosted Model / GPU Infra | ★★☆☆☆ | L4 | 非 Backend 主線需求 |

---

# 5. 建議目標深度

不是每個領域都需要學到 L4。

| 領域 | 建議目標 | 優先級 |
|---|---:|---:|
| Backend Engineering | L4 | ★★★★★ |
| Database Engineering | L3 | ★★★★★ |
| Distributed Systems | L3 | ★★★★★ |
| Messaging / Event-driven | L3 | ★★★★★ |
| SRE / Observability | L3 | ★★★★★ |
| DevOps / Delivery | L3 | ★★★★☆ |
| Cloud Engineering | L2-L3 | ★★★★☆ |
| Kubernetes | L2-L3 | ★★★★☆ |
| Backend Security | L3 | ★★★★☆ |
| AI Engineering | L2-L3 | ★★★☆☆ |

核心原則：

```text
Backend + Database + Distributed Systems
                ↓
        Senior Backend Core

SRE + DevOps + Cloud + Kubernetes
                ↓
       Production Engineering

Security + AI
                ↓
          Capability Extension
```

---

# 6. 學習歷程規劃

以下不是硬性月份，而是一個建議的進行順序。

---

## Stage 0 — 建立技能地圖

### 目標

所有主要領域至少到 L1，先理解全貌與彼此關係。

### 內容

- Distributed Systems 基本概念
- Database transaction / index / lock 基礎
- Kafka 基礎概念
- SRE / Observability 基礎
- AWS 基本服務定位
- Kubernetes 核心 resource
- OAuth2 / OIDC / RBAC 基礎
- LLM / RAG / Agent / MCP 基礎

### 完成條件

能回答：

- 這個技術解什麼問題？
- 它通常出現在系統哪一層？
- 為什麼需要它？
- 與其他技術的關係是什麼？

---

# Stage 1 — Database + Distributed Systems Foundations

### 主軸

```text
PostgreSQL
   +
Distributed Systems
```

### Database

- Transaction
- Isolation Level
- Lock
- Deadlock
- Index
- EXPLAIN
- Query Optimization
- Connection Pool

### Distributed Systems

- Timeout
- Retry
- Exponential Backoff
- Idempotency
- Eventual Consistency
- Circuit Breaker
- Distributed Lock

### 建議實作

使用 NestJS + PostgreSQL + Redis 建立：

```text
Order Service
Payment Service
Inventory Service
```

實驗：

- 同時更新庫存
- Duplicate Request
- Payment Timeout
- Retry
- Deadlock
- Optimistic Lock

### 目標

Database 與 Distributed Systems 達到 L2，部分核心能力開始進入 L3。

---

# Stage 2 — Messaging & Event-driven Architecture

### 主軸

```text
Kafka
+
Transactional Messaging
```

### 學習內容

- Producer / Consumer
- Topic / Partition
- Consumer Group
- Ordering
- Delivery Semantics
- Retry
- DLQ
- Consumer Lag
- Backpressure
- Schema Evolution

### Pattern

- Outbox Pattern
- Saga
- Eventual Consistency
- Idempotent Consumer

### 建議實作

```text
Order
  ↓
Kafka
  ↓
Payment
  ↓
Inventory
  ↓
Notification
```

刻意製造：

- Duplicate Message
- Consumer Crash
- Timeout
- Retry
- Message Failure
- Out-of-order Event

### 目標

Messaging / Distributed Systems 推進到 L3。

---

# Stage 3 — Observability & Production Engineering

### 主軸

```text
OpenTelemetry
Prometheus
Grafana
Load Testing
```

### 內容

建立：

- Structured Log
- Request Metrics
- Error Rate
- p50 / p95 / p99
- Throughput
- DB latency
- Redis latency
- Kafka consumer lag
- Distributed Trace

### Production Concept

- SLI
- SLO
- Alert
- Runbook
- Incident
- RCA

### 實驗

- API 高延遲
- DB Connection Pool Exhaustion
- Redis Failure
- Kafka Consumer Lag
- Memory Leak
- High CPU
- Dependency Timeout

### 目標

SRE / Observability 達 L2-L3。

---

# Stage 4 — DevOps & AWS Production-like Lab

### 主軸

把前面的 Backend System 部署到 AWS。

### Architecture

```text
Internet
   ↓
Route53
   ↓
ALB
   ↓
ECS
   ↓
RDS PostgreSQL
   ↓
ElastiCache Redis
```

其他元件：

- ECR
- IAM
- Secrets Manager
- CloudWatch
- ACM

### CI/CD

```text
Git Push
   ↓
GitHub Actions
   ↓
Test
   ↓
Docker Build
   ↓
ECR
   ↓
ECS Deploy
```

### Terraform

逐步將：

- VPC
- Subnet
- Security Group
- ALB
- ECS
- RDS
- Redis

改由 Terraform 建立。

### Production Drill

刻意操作：

- Deploy Broken Version
- Health Check Failure
- Rollback
- ECS Restart
- DB Connection Failure
- Secret Rotation
- Autoscaling

### 目標

Cloud / DevOps 達 L2，部分 Production 能力進入 L3。

---

# Stage 5 — Kubernetes Production Skills

### 主軸

將既有 Backend workload 從 ECS / Docker 模式轉移到 Kubernetes。

### 內容

- Deployment
- Service
- Ingress
- ConfigMap
- Secret
- Probe
- Request / Limit
- HPA
- Rolling Update
- Rollback
- Helm

### Production Troubleshooting

- CrashLoopBackOff
- OOMKilled
- Readiness Failed
- DNS Failure
- Resource Starvation
- Pod Scheduling Failure

### 目標

Kubernetes 達 L2-L3。

---

# Stage 6 — Backend Security Deepening

### 內容

- OAuth2
- OIDC
- RBAC
- Session
- Refresh Token Rotation
- Revocation
- Device Trust
- API Security
- OWASP
- Secret Management
- Audit Log
- Multi-tenant Authorization
- IAM

### 實作

建立一個 Identity / Access demo：

```text
User
Role
Permission
Tenant
Trusted Device
Session
Audit Log
```

### 目標

Security 達 L3。

---

# Stage 7 — AI Backend Engineering

### 內容

先從 AI Application Integration 開始：

- LLM API
- Streaming
- Structured Output
- Tool Calling
- Embedding
- Vector DB
- RAG
- Agent
- MCP

再進入 Production Concern：

- Evaluation
- Guardrail
- Token Cost
- Cache
- Observability

### 建議實作

建立 AI Backend Service：

```text
Client
  ↓
NestJS AI Gateway
  ↓
LLM Provider
  ↓
Tool Calling
  ↓
Internal API / Database
```

再加入：

```text
RAG
Vector DB
Agent Workflow
Evaluation
```

### 目標

AI Engineering 達 L2-L3。

---

# 7. 長期整合專案

最終不要讓上述能力停留在個別 lab。

建議建立一個長期演進的 Production-like Backend Project，例如：

```text
Backend Forge Lab
```

架構逐步演進：

```text
NestJS
PostgreSQL
Redis

        ↓

Kafka
Outbox
Saga
Idempotency

        ↓

OpenTelemetry
Prometheus
Grafana

        ↓

Docker
GitHub Actions

        ↓

AWS
ECS
RDS
ElastiCache
ALB

        ↓

Terraform

        ↓

Kubernetes

        ↓

Security
AI Integration
```

每學一個領域，都把它整合進同一個系統，而不是建立大量彼此無關的 Tutorial Project。

---

# 8. 每個 Stage 的學習循環

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

## Example：Kafka

### Concept

理解 Topic、Partition、Producer、Consumer。

### Minimal Example

建立 NestJS Producer / Consumer。

### Integration

Order Service 發送 Event 給 Notification Service。

### Failure Scenario

Consumer crash / Duplicate event。

### Observability

觀察 Consumer Lag。

### Trade-off

什麼時候該用 Kafka？什麼時候 REST 比較適合？

### Documentation

整理 Architecture Decision Record。

這樣才能從 L1 持續推進到 L3。

---

# 9. 學習紀錄建議

每一個技能可以建立一份紀錄：

```text
skills/
├ distributed-systems/
│  ├ README.md
│  ├ retry.md
│  ├ idempotency.md
│  ├ outbox.md
│  └ saga.md
│
├ database/
├ kafka/
├ sre/
├ aws/
├ kubernetes/
├ security/
└ ai/
```

每篇內容固定包含：

```text
# Problem

這個技術要解什麼問題？

# Concept

核心概念。

# Implementation

如何實作。

# Failure Case

什麼情況會壞？

# Trade-off

優缺點與替代方案。

# Production Notes

實際 production 要注意什麼？

# Lab

自己做過什麼實驗？

# Current Level

L1 / L2 / L3 / L4
```

---

# 10. 整體優先順序

建議主線：

```text
L1 全領域建立概念
        ↓
Database Engineering
        ↓
Distributed Systems
        ↓
Kafka / Event-driven
        ↓
Observability / SRE
        ↓
AWS Production Lab
        ↓
Terraform / DevOps
        ↓
Kubernetes
        ↓
Backend Security
        ↓
AI Backend Engineering
```

其中核心職涯主線是：

```text
Backend
   +
Database
   +
Distributed Systems
   +
Production Engineering
```

Cloud、Kubernetes、Security、AI 則在這個核心上逐步擴展。

---

# 11. 最終能力目標

這份學習計畫的終點不是「工具清單變長」。

而是從：

```text
我會 NestJS
我會 Redis
我用過 Kafka
我玩過 Kubernetes
```

轉變成：

```text
我能設計 Backend Architecture

我知道資料一致性可能在哪裡失敗

我能設計 transaction / idempotency / retry strategy

我能分析 database bottleneck

我能建立 event-driven system

我能觀察 production system 的健康狀況

我能 debug production failure

我能部署並維護 cloud workload

我能根據 requirement 做 architecture trade-off
```

最終定位：

> **Backend Engineer → Senior Backend Engineer → Backend / Distributed Systems / Production Engineering 能力組合**

而不是單純追求學會更多 Framework。
