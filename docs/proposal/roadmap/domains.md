# Backend Skill Domains

本 roadmap 主要拆成十個領域。

## Backend Engineering

建立穩固的 API、application architecture、testing、error handling、documentation 與 maintainability 能力。重點不是熟悉框架 API，而是建立可維護、可測試、可演進的 backend system。

## Database Engineering

從「會 SQL / ORM」提升到理解 transaction、lock、index、query planning、replication、partition 與 database reliability。Database 應被視為系統設計的一部分，而不只是 storage。

## Distributed Systems

理解系統被拆成多個 process、service、node 後產生的問題，包括 partial failure、consistency、retry、idempotency、eventual consistency、distributed transaction、scalability 與 availability。

## Messaging & Event-driven Architecture

理解 queue、pub/sub、Kafka、consumer group、partition、ordering、retry、DLQ、backpressure 與 transactional messaging。此領域與 Distributed Systems 高度交叉，但保留獨立區塊方便實作。

## DevOps & Delivery

建立 source code 到 production deployment 的流程能力，涵蓋 Docker、CI/CD、artifact、container registry、environment、secret、deployment strategy、IaC 與 GitOps。

## Cloud Engineering

以 Backend Engineer 的角度學 cloud，掌握 production backend 常見元件：compute、network、database、cache、storage、messaging、IAM 與 observability。

## Kubernetes & Container Orchestration

理解 backend workload 如何可靠地部署、擴展、復原與更新。學習重點包含 probe、resource management、rolling update、HPA、scheduling、networking、storage 與 troubleshooting。

## SRE & Observability

學習如何知道系統是否健康，以及 production incident 發生時如何定位與處理。核心內容包含 metrics、logs、traces、OpenTelemetry、Prometheus、Grafana、SLI/SLO/SLA、alert、incident、RCA 與 capacity planning。

## Backend Security

建立 Backend Engineer 必要的 security engineering 基礎，包括 authentication、authorization、OAuth2/OIDC、RBAC/ABAC、session/token、TLS、secret management、OWASP、IAM、audit log 與 multi-tenant security。

## AI Engineering for Backend

讓 Backend Engineer 能設計與維護 AI application backend。包含 LLM API、structured output、tool calling、RAG、vector database、agent、MCP、evaluation、guardrail、token/cost management 與 AI-assisted software engineering。
