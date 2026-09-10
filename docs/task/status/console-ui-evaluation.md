# Console UI / TUI 評估

## 評估結論

目前先暫緩實作完整 console UI / TUI。

原因：

- 現有 CLI 已完成一致化輸出，短期可讀性足夠。
- `lab:run` 已有 structured run artifacts，`lab:report` 已能產生 HTML summary。
- 目前 active labs 數量仍少，TUI 對效率提升有限。
- 過早引入 TUI framework 會增加 dependency、互動狀態與測試成本。

## 目前替代方案

短期維持：

```text
lab:list   -> 掃描可用 labs
lab:info   -> 查看 manifest / runtime / experiments
lab:run    -> 執行 experiment 並保存 artifact
lab:report -> 產生 HTML report
```

## 重新評估時機

等以下條件成立時再評估 TUI：

- Active labs 超過 8 到 10 個
- 同一個 lab 有多組 run artifacts 需要互動比較
- 需要跨 lab 篩選 status / level / domain / failed runs
- 需要 watch mode 或 long-running experiments
- 需要半互動式操作 lifecycle：up -> run -> observe -> down

## 可行 UI 方向

若未來要做，建議先做 read-only TUI，再做互動 command：

```text
Phase A: Read-only dashboard
- list labs by domain/status/level
- show latest run status
- open report path

Phase B: Guided runner
- select lab
- select experiment
- run and stream output
- show artifact/report path

Phase C: Watch mode
- watch long-running experiment
- refresh status/logs
- highlight failed runs
```
