# Backend Forge Lab

> A scenario-driven backend engineering lab for learning, reproducing, breaking, observing, and validating production-like backend behaviors.

---

## 1. Project Purpose

`backend-forge-lab` 是一個以「情境實驗（scenario-based experiments）」為核心的後端工程學習專案。

它的目的不是建立正式產品，也不是單純收集 Docker Compose、Kubernetes、Helm 或 Terraform YAML，而是把 Backend Engineer 在 Database、Distributed Systems、Messaging、Observability、Cloud、Kubernetes、Security、AI 等領域需要理解的工程問題，轉換成可以重現、操作、破壞、觀察與驗證的 Lab。

本專案應搭配：

```text
backend-skill-development-roadmap.md
```

使用。

Roadmap 負責定義：

- 要學習哪些 Backend Engineering Domain
- 每個主題的重要程度
- 建議學習階段 L1～L4
- 整體學習順序

Backend Forge Lab 則負責把 Roadmap 中適合實作的項目轉換成可執行的工程實驗。

整體關係：

```text
Skill Roadmap
    ↓
Concept / Topic
    ↓
Backend Forge Lab
    ↓
Scenario Experiment
    ↓
Observation
    ↓
Trade-off / Conclusion
    ↓
Reusable Pattern
    ↓
backend-forge-kit
```

---

## 2. Project Positioning

Backend Forge 生態系可分成以下角色：

```text
backend-forge-handbook
        ↓
Knowledge / Design Notes

backend-forge-lab
        ↓
Experiment / Validation / Failure Simulation

backend-forge-kit
        ↓
Reusable Backend Libraries / Patterns / Nx Generators
```

### backend-forge-handbook

負責：

- 原理
- 概念
- Architecture Decision
- Trade-off
- 學習筆記
- 設計分析

### backend-forge-lab

負責：

- Infrastructure Scenario
- Backend Scenario
- Failure Injection
- Load Testing
- Observability
- Benchmark
- Production-like Experiment

### backend-forge-kit

負責：

- 穩定
- 經 Lab 驗證
- 可跨專案重用
- 有明確抽象價值

的 Backend Library 或 Infrastructure Wrapper。

---

## 3. Core Philosophy

Backend Forge Lab 不以「完成技術 Demo」作為主要學習目標。

每個 Lab 應該回答一個明確的工程問題。

例如不應只建立：

```text
Kafka Demo
```

而應建立：

```text
Kafka Consumer Duplicate Message
```

並回答：

> Consumer 重複收到訊息時，如何確保 business operation 不會被重複執行？

同樣地，不應只建立：

```text
PostgreSQL Demo
```

而應建立：

```text
Concurrent Inventory Update
```

並比較：

- naive update
- atomic update
- optimistic locking
- pessimistic locking
- distributed lock

因此每個 Lab 原則上應包含：

```text
Problem
    ↓
Environment
    ↓
Scenario
    ↓
Experiment
    ↓
Failure / Load
    ↓
Observation
    ↓
Solution
    ↓
Trade-off
```

---

# 4. Learning Level Mapping

Backend Forge Lab 使用與 Skill Development Roadmap 相同的 L1～L4 定義。

| Level | Definition | Lab Expectation |
|---|---|---|
| L1 | Understand | 理解概念與基本元件，可建立最小 Demo |
| L2 | Implement | 能獨立建立並執行情境 |
| L3 | Operate | 能模擬 Failure / Load，分析與修復問題 |
| L4 | Design | 能比較不同架構方案並做 Trade-off 決策 |

可以簡化理解為：

```text
L1 = Explain
L2 = Build
L3 = Break & Fix
L4 = Design & Decide
```

並非每一個 Lab 都必須做到 L4。

Lab 應依照 `backend-skill-development-roadmap.md` 中該主題的 Target Level 決定實驗深度。

---

# 5. Project Scope

預計涵蓋以下 Backend Engineering Domains：

```text
backend-forge-lab
│
├── database
├── distributed-systems
├── messaging
├── observability
├── devops
├── cloud
├── kubernetes
├── security
└── ai
```

## 5.1 Database

可能的 Lab：

```text
database/
├── transaction-isolation
├── deadlock
├── concurrent-inventory
├── optimistic-lock
├── pessimistic-lock
├── indexing
├── query-plan
├── connection-pool
├── partitioning
└── replication
```

## 5.2 Distributed Systems

```text
distributed-systems/
├── timeout-retry
├── idempotency
├── distributed-lock
├── transactional-outbox
├── saga
├── eventual-consistency
├── circuit-breaker
└── backpressure
```

## 5.3 Messaging

```text
messaging/
├── kafka-basic
├── kafka-duplicate-message
├── kafka-ordering
├── kafka-consumer-group
├── kafka-retry
├── kafka-dlq
└── kafka-consumer-lag
```

## 5.4 Observability / SRE

```text
observability/
├── structured-logging
├── metrics
├── distributed-tracing
├── opentelemetry
├── prometheus-grafana
├── latency-analysis
├── incident
└── load-testing
```

## 5.5 Cloud

```text
cloud/
└── aws/
    ├── ecs-rds
    ├── alb-autoscaling
    ├── elasticache
    ├── cloudwatch
    ├── iam
    └── failure-recovery
```

## 5.6 Kubernetes

```text
kubernetes/
├── deployment
├── readiness-liveness
├── rolling-update
├── rollback
├── hpa
├── resource-limit
├── pod-failure
├── pdb
└── observability
```

## 5.7 Security

```text
security/
├── jwt
├── oauth2
├── oidc
├── rbac
├── rate-limit
├── secret-management
├── audit-log
└── api-security
```

## 5.8 AI Engineering

```text
ai/
├── llm-api
├── structured-output
├── streaming
├── tool-calling
├── rag
├── vector-db
├── agent
├── mcp
├── evaluation
└── llm-observability
```

---

# 6. Recommended Repository Structure

初始建議結構：

```text
backend-forge-lab/
│
├── README.md
├── package.json
├── tsconfig.json
│
├── docs/
│   ├── backend-skill-development-roadmap.md
│   └── backend-forge-lab.md
│
├── tools/
│   └── lab-cli/
│       ├── commands/
│       ├── adapters/
│       ├── manifest/
│       └── utils/
│
├── labs/
│   ├── database/
│   ├── distributed-systems/
│   ├── messaging/
│   ├── observability/
│   ├── devops/
│   ├── cloud/
│   ├── kubernetes/
│   ├── security/
│   └── ai/
│
└── shared/
    ├── docker/
    ├── dashboards/
    ├── scripts/
    ├── configs/
    └── test-services/
```

---

# 7. Scenario Ownership Principle

每一個 Lab 必須盡可能 Self-contained。

例如：

```text
labs/
└── distributed-systems/
    └── idempotency-payment/
        ├── README.md
        ├── lab.yaml
        ├── docker-compose.yml
        │
        ├── app/
        │   └── payment-service/
        │
        ├── experiments/
        │   ├── duplicate-request.ts
        │   ├── concurrent-request.ts
        │   └── timeout-after-commit.ts
        │
        ├── load/
        │   └── concurrent.js
        │
        └── config/
```

Lab 自己應持有：

- Infrastructure
- Scenario config
- Experiment scripts
- Failure injection
- Load scripts
- README
- Lab manifest

避免 Lab 過度依賴整個 repository 才能理解或執行。

---

# 8. Lab Manifest

每一個 Lab 應提供：

```text
lab.yaml
```

用來描述 Lab metadata 與 execution lifecycle。

Example：

```yaml
name: database-deadlock

domain: database

level: L2

description: >
  Reproduce PostgreSQL transaction deadlock
  and observe database deadlock detection behavior.

skills:
  - transaction
  - locking
  - deadlock

roadmap:
  importance: 5
  targetLevel: L3

runtime:
  type: docker-compose
  file: docker-compose.yml

commands:
  up: docker compose up -d
  down: docker compose down
  reset: docker compose down -v

experiments:
  deadlock:
    command: npm run experiment:deadlock

cleanup:
  destructive: false
```

---

# 9. Supported Runtime Types

Backend Forge Lab 預計支援：

```text
docker-compose
kubernetes
helm
terraform
script
```

## 9.1 Docker Compose

適合：

- PostgreSQL
- Redis
- Kafka
- Prometheus
- Grafana
- OpenTelemetry Collector
- Local microservices

Lifecycle：

```text
up
down
reset
logs
status
```

## 9.2 Kubernetes

適合：

- deployment lifecycle
- pod failure
- readiness / liveness
- HPA
- rolling update
- resource limits

Lifecycle：

```text
apply
delete
status
logs
restart
```

## 9.3 Helm

適合：

- packaged Kubernetes services
- configurable deployment
- upgrade / rollback experiment

Lifecycle：

```text
install
upgrade
rollback
uninstall
status
```

## 9.4 Terraform

適合：

- AWS
- Cloud infrastructure
- IaC
- Production-like deployment

Lifecycle：

```text
init
plan
apply
output
destroy
```

Cloud Lab 必須特別注意：

```text
terraform destroy
```

避免產生持續計費資源。

---

# 10. Root Scenario Runner

Repository Root 應提供統一 Scenario Runner。

初期可以透過：

```text
package.json
+
TypeScript scripts
```

實現。

後續可逐步演進為：

```text
forge-lab CLI
```

## 10.1 Expected Commands

第一階段建議：

```bash
npm run lab:list

npm run lab:info -- database/deadlock

npm run lab:up -- database/deadlock

npm run lab:status -- database/deadlock

npm run lab:down -- database/deadlock

npm run lab:reset -- database/deadlock
```

## 10.2 Experiment Execution

```bash
npm run lab:run -- \
  distributed-systems/idempotency \
  duplicate-request
```

或未來：

```bash
forge-lab run \
  distributed-systems/idempotency \
  duplicate-request
```

## 10.3 Extended Commands

未來可支援：

```text
lab:list
lab:info
lab:prepare
lab:up
lab:down
lab:destroy
lab:reset
lab:status
lab:logs
lab:run
lab:load
lab:fail
lab:observe
lab:clean
```

---

# 11. Unified Lab Lifecycle

所有 Lab 儘量遵守共同生命週期：

```text
prepare
   ↓
up
   ↓
run
   ↓
observe
   ↓
down / destroy
```

其中：

### prepare

負責：

- dependency check
- environment check
- image build
- Terraform init
- Helm dependency
- required config

### up

啟動 Lab infrastructure。

### run

執行：

- business scenario
- failure scenario
- load test
- benchmark

### observe

觀察：

- logs
- metrics
- tracing
- database state
- Kafka lag
- infrastructure state

### down

停止 local infrastructure。

### destroy

完全刪除 infrastructure。

Cloud Lab 原則上應使用：

```text
destroy
```

而不是只有 down。

---

# 12. Runtime Adapter Design

Scenario Runner 不應直接寫死：

```text
docker compose
kubectl
helm
terraform
```

後續可以抽象：

```text
LabRuntimeAdapter
│
├── DockerComposeAdapter
├── KubernetesAdapter
├── HelmAdapter
├── TerraformAdapter
└── ScriptAdapter
```

統一介面概念：

```text
prepare()
up()
down()
destroy()
status()
logs()
```

這樣 Root CLI 只需要：

```text
read lab.yaml
    ↓
resolve runtime
    ↓
load adapter
    ↓
execute lifecycle
```

---

# 13. Package Scripts

初始 package.json 可以提供：

```json
{
  "scripts": {
    "lab:list": "tsx tools/lab-cli/list.ts",
    "lab:info": "tsx tools/lab-cli/info.ts",
    "lab:up": "tsx tools/lab-cli/up.ts",
    "lab:down": "tsx tools/lab-cli/down.ts",
    "lab:reset": "tsx tools/lab-cli/reset.ts",
    "lab:status": "tsx tools/lab-cli/status.ts",
    "lab:run": "tsx tools/lab-cli/run.ts"
  }
}
```

初期不需要過度設計完整 CLI Framework。

優先完成：

```text
list
info
up
down
reset
run
```

即可。

---

# 14. Lab README Standard

每個 Lab 都必須有 README。

推薦模板：

```md
# Lab: <Lab Name>

## Problem

這個 Lab 想解決什麼工程問題？

## Learning Goal

對應 Skill Roadmap 中哪些能力？

## Level

L1 / L2 / L3 / L4

## Background

執行 Lab 前需要知道哪些概念？

## Architecture

Infrastructure / Service Architecture。

## Scenario

如何重現問題？

## Setup

啟動方式。

## Experiment

操作步驟。

## Failure Injection

如何觸發錯誤？

## Observation

需要觀察哪些：

- logs
- metrics
- traces
- DB state
- queue state

## Expected Result

預期結果。

## Solution

如何解決問題？

## Trade-offs

有哪些替代解法？

## Production Considerations

真實 Production 還要考慮什麼？

## Cleanup

如何完全清除資源？

## Promotion Candidate

哪些部分可能值得抽成 backend-forge-kit？
```

---

# 15. Infrastructure Is Not the Experiment

Backend Forge Lab 必須遵守一個重要原則：

> 啟動 infrastructure 本身，不等於完成 Lab。

例如：

```text
docker compose up kafka
```

只代表 Kafka Infrastructure Ready。

真正的實驗可能是：

```text
producer publish
    ↓
consumer receive
    ↓
consumer crash before commit
    ↓
restart
    ↓
message redelivery
    ↓
duplicate business operation
```

因此每個 Lab 應盡可能包含：

```text
Infrastructure
+
Workload
+
Failure
+
Observation
```

---

# 16. Failure-first Learning

進入 L3 後，Lab 應刻意加入 failure scenario。

例如：

## Database

```text
deadlock
connection exhaustion
transaction timeout
lock contention
```

## Distributed Systems

```text
timeout
duplicate request
network failure
partial success
retry storm
```

## Kafka

```text
consumer crash
duplicate message
poison message
consumer lag
out-of-order
```

## Kubernetes

```text
pod crash
probe failure
CPU spike
memory limit
bad deployment
```

## Cloud

```text
instance failure
bad health check
autoscaling
permission denied
deployment rollback
```

---

# 17. Observability Requirement

L2 以上 Lab 應逐步導入 Observability。

推薦統一使用：

```text
Structured Logs
Metrics
Tracing
```

未來 shared infrastructure 可提供：

```text
shared/
└── observability/
    ├── prometheus
    ├── grafana
    ├── otel-collector
    └── dashboards
```

但 Lab 應避免過度依賴 shared configuration。

只有明顯可重用的部分才放 shared。

---

# 18. Application Code Policy

Backend Forge Lab 不是正式 Application Monorepo。

Application Code 的目的只是：

- 產生 workload
- 模擬 business logic
- 重現 distributed behavior
- 提供觀察目標

因此 test service 應保持：

```text
small
explicit
easy to understand
easy to destroy
```

不要為了 Lab 建立大量：

- Domain abstraction
- Generic framework
- Complex Nx architecture
- unnecessary shared library

如果某個 abstraction 經多個 Lab 驗證後確定值得重用，應考慮移至：

```text
backend-forge-kit
```

---

# 19. Technology Preference

目前主要 Backend 技術偏好：

```text
Node.js
TypeScript
NestJS
PostgreSQL
Redis
Kafka
Docker
Kubernetes
Helm
Terraform
OpenTelemetry
Prometheus
Grafana
AWS
```

但 Backend Forge Lab 的核心是：

```text
Engineering Problem
```

而不是：

```text
Technology Collection
```

因此未來若某個實驗使用其他工具更適合，可以接受。

---

# 20. Initial Project Setup

## Step 1 — Initialize Repository

```bash
mkdir backend-forge-lab
cd backend-forge-lab

npm init -y
```

## Step 2 — TypeScript Tooling

安裝：

```bash
npm install -D typescript tsx @types/node
```

建立：

```text
tsconfig.json
```

## Step 3 — Create Base Structure

建立：

```text
docs/
tools/lab-cli/
labs/
shared/
```

以及：

```text
labs/database
labs/distributed-systems
labs/messaging
labs/observability
labs/devops
labs/cloud
labs/kubernetes
labs/security
labs/ai
```

## Step 4 — Add Skill Roadmap

將：

```text
backend-skill-development-roadmap.md
```

放入：

```text
docs/
```

本文件建議放：

```text
docs/backend-forge-lab.md
```

## Step 5 — Implement Minimal Scenario Runner

第一版只需要：

```text
lab:list
lab:info
lab:up
lab:down
lab:reset
lab:run
```

不需要一開始就建立完整 framework。

## Step 6 — Create First Lab

推薦：

```text
labs/database/transaction-isolation
```

或：

```text
labs/database/deadlock
```

理由：

- Infrastructure 簡單
- 只需要 PostgreSQL
- 容易重現
- 可以快速驗證 Lab framework

---

# 21. Recommended First Labs

第一階段建議依序：

```text
01 Database
├── transaction-isolation
├── concurrent-inventory
└── deadlock

02 Distributed Systems
├── timeout-retry
├── idempotency
└── transactional-outbox

03 Observability
└── otel-request-tracing

04 Cloud
└── aws-ecs-rds
```

完成這一批後，再進入：

```text
Kafka
Saga
Prometheus / Grafana
Kubernetes
Terraform advanced usage
```

---

# 22. Lab Creation Workflow

Local Agent 在新增 Lab 前，應先：

```text
1. Read backend-skill-development-roadmap.md
2. Confirm Domain
3. Confirm Topic
4. Confirm Importance
5. Confirm Target Level
6. Define Engineering Problem
7. Define Scenario
8. Select Runtime
9. Create Lab
10. Write Observation / Conclusion
```

---

# 23. Agent Implementation Rules

本地 Agent 在此 repository 進行開發時，應遵守以下規則。

## Rule 1

不要因為 Roadmap 出現某個技術，就立刻建立 Lab。

必須先定義：

```text
What engineering problem are we trying to reproduce?
```

## Rule 2

一個 Lab 原則上只聚焦一個主要問題。

避免：

```text
kafka-complete-demo
```

這類過於龐大的 Lab。

偏好：

```text
kafka-duplicate-message
kafka-ordering
kafka-consumer-lag
```

## Rule 3

優先使用最小 Infrastructure。

例如研究 PostgreSQL Deadlock：

不要同時加入：

```text
Kafka
Redis
Kubernetes
Grafana
```

除非實驗真的需要。

## Rule 4

L1 不需要過度 Production 化。

L2 重視：

```text
implementation
```

L3 才加入：

```text
failure
load
observability
```

L4 才要求：

```text
architecture trade-off
```

## Rule 5

不要過早抽象共用程式。

至少在：

```text
2~3 Labs
```

出現相同 pattern 後，再考慮 shared abstraction。

## Rule 6

Backend Forge Lab 的 code 不等於 Backend Forge Kit。

Lab 中的 code 可以：

```text
explicit
experimental
scenario-specific
```

Kit 才要求：

```text
generic
stable
tested
reusable
```

---

# 24. Promotion to Backend Forge Kit

一個 Lab 中的 component 可以考慮升格到：

```text
backend-forge-kit
```

需要至少符合：

```text
✓ 已完成實驗驗證
✓ 不只適用單一 Scenario
✓ API / abstraction 已穩定
✓ 有明確 reusable value
✓ 有測試
✓ 已理解 trade-off
```

例如：

```text
idempotency service
outbox publisher
Kafka retry wrapper
distributed lock abstraction
OpenTelemetry setup
```

都可能成為候選。

---

# 25. Cloud Safety

Cloud Lab 必須額外考慮成本。

Terraform Lab 應優先提供：

```text
destroy
```

並在 README 清楚標註：

```text
Billable Resources
```

Scenario Runner 未來可以加入：

```text
costWarning: true
```

Example：

```yaml
runtime:
  type: terraform

cloud:
  provider: aws
  costWarning: true

cleanup:
  destructive: true
  command: terraform destroy
```

---

# 26. Naming Convention

Lab folder 建議：

```text
<domain>/<scenario>
```

Example：

```text
database/deadlock
distributed-systems/idempotency
messaging/kafka-duplicate-message
observability/otel-request-tracing
kubernetes/readiness-failure
cloud/aws-ecs-rds
```

名稱應描述：

```text
Problem / Scenario
```

而不是只有 Technology Name。

---

# 27. Expected Developer Experience

Backend Forge Lab 最終希望達成：

```bash
npm run lab:list
```

找到：

```text
database/deadlock
distributed-systems/idempotency
messaging/kafka-duplicate-message
observability/otel-request-tracing
```

接著：

```bash
npm run lab:info -- database/deadlock
```

了解：

- learning goal
- level
- runtime
- dependencies
- experiments

啟動：

```bash
npm run lab:up -- database/deadlock
```

執行：

```bash
npm run lab:run -- database/deadlock deadlock
```

觀察結果。

最後：

```bash
npm run lab:down -- database/deadlock
```

Cloud 情境則：

```bash
npm run lab:destroy -- cloud/aws-ecs-rds
```

---

# 28. Long-term Vision

Backend Forge Lab 最終不是單純的練習 repository。

它應該逐漸成為：

> Personal Production Engineering Playground

可以用來：

- 重現 Backend Engineering Problems
- 驗證 Architecture Pattern
- 進行 Load Test
- 模擬 Failure
- 練習 Incident Analysis
- 學習 Cloud Deployment
- 驗證 Infrastructure Design
- 建立 reusable Backend Pattern

最後形成：

```text
Roadmap
    ↓
Knowledge
    ↓
Lab
    ↓
Failure
    ↓
Observation
    ↓
Conclusion
    ↓
Reusable Pattern
    ↓
Backend Forge Kit
```

---

# 29. Guiding Principle

Backend Forge Lab 最重要的原則：

> Don't just make it run.
>
> Make it fail, observe why it fails, fix it, and understand the trade-off.

中文可理解為：

> 不只是讓系統跑起來，而是刻意讓它失敗、觀察失敗原因、理解修復方式，最後知道不同解法的取捨。

這才是 Backend Forge Lab 與一般 Tutorial Repository 最大的差異。
