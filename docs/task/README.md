# Task

Task 文件記錄目前 Lab Framework 狀態、active labs、backlog 與工具評估。

這裡是工作追蹤文件，不放長期理念與完整設計規格。

Task 排序應對齊 roadmap 的 breadth-first 原則：先補齊多個 domain 的 L1/L2 接觸面，再挑高價值主題進 L3/L4。

## 文件

| 文件 | 說明 |
|---|---|
| `status/lab-framework-status.md` | Lab Framework 已完成能力 |
| `status/active-labs.md` | 目前 active labs 與 domain progress |
| `status/backlog.md` | Next / Planned / Later backlog |
| `status/console-ui-evaluation.md` | Console UI / TUI 評估 |

## 維護原則

- 已完成的 implementation 細節不在本層長期展開。
- 每個 lab 的情境、實驗、預期結果與 cleanup 寫在該 lab README。
- 每次實驗執行證據以 `runs/<run-id>/metadata.json` 與 `output.log` 保存。
- 只有真正跨兩到三個 labs 重複出現的 runtime plumbing 才抽到 runner 或 shared。
