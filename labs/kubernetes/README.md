# Kubernetes Labs

Kubernetes labs 用來練習 backend workload 的部署、擴展、復原、更新與 troubleshooting。重點不是背 YAML，而是理解 probe、resource、rollout、network 與 failure behavior。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `kubernetes/deployment-service` | Deployment、Service、replica、basic rollout |
| 2 | `kubernetes/readiness-liveness` | probe failure、traffic removal、restart behavior |
| 3 | `kubernetes/resource-limit` | request/limit、OOMKilled、CPU throttling |
| 4 | `kubernetes/rolling-update-rollback` | rolling update、bad version、rollback |
| 5 | `kubernetes/hpa` | autoscaling、metrics dependency、load response |
| 6 | `kubernetes/config-secret` | ConfigMap、Secret、runtime config change |
| 7 | `kubernetes/ingress-routing` | ingress、path routing、TLS termination |
| 8 | `kubernetes/troubleshooting` | CrashLoopBackOff、DNS failure、events、logs |
| 9 | `kubernetes/pdb-disruption` | disruption budget 與 availability |
| 10 | `kubernetes/network-policy` | service isolation 與 cluster network security |

## 工具 / 框架操作練習

- kind / minikube local cluster
- kubectl apply/get/describe/logs/events
- Helm chart install / upgrade / rollback
- metrics-server / HPA
- ingress controller
- manifest diff / rollout history

## 建議整合情境

把前面已完成的 backend service workload 轉到 Kubernetes，先完成 Deployment / Service，再逐步加入 probe、resource limit、HPA、rolling update 與 troubleshooting。

## 設計原則

- 每個 lab 都要有 failure trigger 和 observation path。
- Kubernetes adapter default 應等 2 到 3 個 Kubernetes labs 穩定後再抽。
