# DevOps Labs

DevOps labs 用來練習從 source code 到 deployable artifact 的流程：Docker、CI/CD、artifact、registry、environment、secret、deployment strategy 與 IaC。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `devops/docker-image-layers` | Dockerfile、layer cache、build context、image size |
| 2 | `devops/docker-compose-local-env` | local service orchestration、network、volume、healthcheck |
| 3 | `devops/ci-quality-gate` | test、typecheck、lint、artifact build gate |
| 4 | `devops/container-registry` | image tag、promotion、rollback reference |
| 5 | `devops/env-secret-management` | env var、secret injection、rotation drill |
| 6 | `devops/deployment-strategy` | rolling、blue-green、canary、rollback |
| 7 | `devops/terraform-basics` | IaC init/plan/apply/destroy lifecycle |
| 8 | `devops/gitops-basics` | desired state、sync、drift detection |

## 工具 / 框架操作練習

- Dockerfile optimization
- Docker Compose healthcheck
- GitHub Actions 或等價 CI workflow
- image registry 操作
- release artifact metadata
- Terraform lifecycle
- deployment rollback drill

## 建議整合情境

使用小型 NestJS service 作為 workload，逐步加入 Docker build、CI quality gate、registry publish、environment promotion 與 rollback。

## 設計原則

- DevOps lab 不只是能 build，而是要能觀察 artifact 如何被驗證、推進、回滾。
- Cloud 或 Kubernetes 前的 local delivery 能力要先穩定。
