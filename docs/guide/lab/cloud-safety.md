# Cloud Safety

Cloud lab 必須額外考慮成本與資源清除。

## 必要要求

Cloud lab README 必須清楚標註：

- Billable resources
- Region
- Required credentials / IAM scope
- Estimated risk 或 cost note
- Cleanup / destroy command
- 如何確認資源已刪除

任何 cloud lab 如果沒有記錄如何移除 billable resources，都不應視為完成。

## Cleanup Gate

Cloud lab 應在 manifest 中標記 destructive cleanup：

```yaml
cleanup:
  destructive: true
  command: terraform destroy
```

Runner 執行 destructive lifecycle 時應要求明確確認，例如 `--yes`。

## 原則

Cloud lab 原則上應使用 `destroy`，而不是只有 `down`。`down` 可以停止 workload，但不代表已清除持續計費資源。
