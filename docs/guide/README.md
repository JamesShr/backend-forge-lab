# Guide

Guide 文件說明 Backend Forge Lab 的設計方式與實作約定。這裡不記錄當前進度，也不展開完整 roadmap。

## 文件

| 文件 | 說明 |
|---|---|
| `lab/philosophy.md` | Lab 核心理念與定位 |
| `lab/lab-initialization.md` | 初始化一個 lab 的基本框架與 Docker Compose baseline |
| `lab/repository-structure.md` | Repository 與 lab folder 結構 |
| `lab/manifest.md` | `lab.yaml` manifest 規格 |
| `lab/runner-lifecycle.md` | Scenario runner 與 lifecycle |
| `lab/authoring-rules.md` | 新增 lab 的撰寫規則 |
| `lab/cloud-safety.md` | Cloud lab 成本與 cleanup 規則 |

## 新增 Lab 時的快速路徑

1. 先讀 `lab/philosophy.md`，確認 lab 要回答的工程問題。
2. 參考 `lab/lab-initialization.md` 建立基本資料夾、manifest、runtime config 與 experiments。
3. 用 `lab/manifest.md` 檢查 `lab.yaml` 是否描述清楚 runtime、commands、experiments 與 cleanup。
4. 用 `lab/runner-lifecycle.md` 確認 root runner 可以執行共同 lifecycle。
