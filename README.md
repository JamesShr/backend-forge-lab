# Backend Forge Lab

Backend Forge Lab 是一個以情境為核心的後端工程實驗室，用來學習、重現、破壞、觀察與驗證接近 production 的後端系統行為。

這個 repository 不是正式產品應用，也不是一組彼此獨立的技術 demo。每個 lab 都應從明確的工程問題出發，提供一個小型、可重現、可觀察、可清理的實驗環境。

## 核心主題

```text
Concept
  -> Scenario
  -> Experiment
  -> Failure / Load
  -> Observation
  -> Solution
  -> Trade-off
  -> Reusable Pattern
```

目標不是單純讓 infrastructure 跑起來，而是理解什麼會失敗、為什麼會失敗、如何觀察失敗，以及不同修復方式會帶來哪些 trade-off。

## 文件導覽

| 入口 | 用途 |
|---|---|
| `docs/README.md` | 文件總導覽 |
| `docs/proposal/README.md` | 學習方向、能力模型、roadmap |
| `docs/guide/README.md` | Lab 設計規則、初始化框架、runner lifecycle |
| `docs/task/README.md` | 目前狀態、active labs、backlog、工具評估 |
| `AGENTS.md` | Agent 探索或實作 lab 時的閱讀順序 |

新增或理解 lab 時，優先從 `docs/guide/lab/lab-initialization.md` 開始，它整理了目前 database labs 的基本框架、`lab.yaml` pattern、Docker Compose baseline 與 `experiments/` 分工。

## Repository 區域

| 位置 | 說明 |
|---|---|
| `docs/` | 長期文件與導覽 |
| `tools/lab-cli/` | Scenario runner 實作 |
| `labs/` | 依 domain 分組的 scenario experiments |
| `shared/` | 經多個 labs 驗證後才抽出的共用支援資源 |

## Lab Domains

```text
labs/
├── ai/
├── cloud/
├── database/
├── devops/
├── distributed-systems/
├── kubernetes/
├── messaging/
├── observability/
└── security/
```

目前主要從 `database/` labs 開始，逐步擴展到 distributed systems、messaging、observability、cloud、kubernetes、security 與 AI backend engineering。

## 與 Backend Forge 的關係

```text
backend-forge-handbook
  -> 知識、筆記、設計決策、trade-off 分析

backend-forge-lab
  -> 實驗、failure simulation、觀察、驗證

backend-forge-kit
  -> 可重用的後端 library、wrapper、pattern、Nx generator
```

Lab 中的 code 只有在經過足夠多情境驗證，並且值得形成穩定可重用抽象時，才應該移到 `backend-forge-kit`。

## 指導原則

不要只是讓它跑起來。

要讓它失敗、觀察它為什麼失敗、修復它，並理解其中的 trade-off。
