# Cloud Labs

Cloud labs 用 Backend Engineer 視角練習 production backend 常見雲端元件：compute、network、database、cache、storage、messaging、IAM、observability 與 reliability。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `cloud/aws-ecs-rds` | ALB -> ECS -> RDS PostgreSQL 基礎部署 |
| 2 | `cloud/aws-vpc-subnet-security-group` | VPC、subnet、route、security group access control |
| 3 | `cloud/aws-ecs-autoscaling` | target tracking、load、scale out/in |
| 4 | `cloud/aws-rds-failure-recovery` | Multi-AZ、connection failure、restore drill |
| 5 | `cloud/aws-elasticache-redis` | managed Redis、cache failure、timeout |
| 6 | `cloud/aws-sqs-sns` | cloud messaging、retry、DLQ |
| 7 | `cloud/aws-cloudwatch-alert` | logs、metrics、alarm、incident signal |
| 8 | `cloud/aws-cost-cleanup` | cost visibility、resource inventory、destroy validation |

## 工具 / 框架操作練習

- AWS CLI
- Terraform AWS provider
- ECS / ECR / ALB / RDS
- IAM role / policy least privilege
- Secrets Manager
- CloudWatch logs / metrics / alarms
- cost cleanup checklist

## Cloud Safety

所有 cloud labs 必須包含：

- billable resources 清單
- estimated cost note
- explicit cleanup / destroy command
- 驗證資源已刪除的方式

## 設計原則

- 不建立 AWS service demo；每個 lab 必須是 production backend scenario。
- Cloud labs 預設 Later，等 local database / distributed / observability labs 更穩定後再推進。
