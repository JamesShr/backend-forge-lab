# Repository Structure

Backend Forge Lab 的 root structure：

```text
backend-forge-lab/
├── README.md
├── package.json
├── tsconfig.json
├── docs/
├── tools/
│   └── lab-cli/
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
└── shared/
```

## Scenario Ownership Principle

每一個 lab 必須盡可能 self-contained。

範例：

```text
labs/
└── distributed-systems/
    └── idempotency-payment/
        ├── README.md
        ├── lab.yaml
        ├── docker-compose.yml
        ├── app/
        ├── experiments/
        ├── load/
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

避免 lab 過度依賴整個 repository 才能理解或執行。

## `shared/` 使用原則

`shared/` 只放真正跨多個 labs 重用的支援資源。不要太早抽象共用程式。

至少在兩到三個 labs 出現相同 pattern 後，再考慮抽到 shared。
