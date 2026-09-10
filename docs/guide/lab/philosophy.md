# Lab Philosophy

Backend Forge Lab 不以「完成技術 demo」作為主要學習目標。

每個 lab 應該回答一個明確的工程問題。

## Backend Forge 生態系

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

`backend-forge-lab` 的 code 只有在經過多個情境驗證、API 穩定、具備明確 reusable value 後，才應考慮升格到 `backend-forge-kit`。

## Infrastructure Is Not the Experiment

啟動 infrastructure 本身，不等於完成 lab。

例如：

```text
docker compose up kafka
```

只代表 Kafka infrastructure ready。真正的實驗應包含 workload、failure、observation 與 conclusion。

## Failure-first Learning

進入 L3 後，lab 應刻意加入 failure scenario。

範例：

- Database: deadlock、connection exhaustion、lock contention
- Distributed Systems: timeout、duplicate request、partial success、retry storm
- Messaging: consumer crash、duplicate message、poison message、consumer lag
- Kubernetes: pod crash、probe failure、bad deployment、resource starvation
- Cloud: instance failure、bad health check、permission denied、deployment rollback

## Lab 基本流程

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
