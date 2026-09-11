# Lab: Structured Logging

## Problem

當一個 backend request 跨越 API handler、service layer、repository 與 downstream call 時，如何用 structured logs 和 correlation/request id 讓同一個 request 的事件可以被查詢、串起來、診斷？

## Learning Goal

這個 lab 對應 Observability L2 baseline：

- Structured logging
- Request id
- Correlation id
- Context propagation
- Error correlation
- Log query mental model

## Level

目前狀態：L2 active。

目標狀態：先建立 script-only 可執行情境，再逐步深化到 L3，加入 log sampling、PII redaction、async job correlation、OpenTelemetry trace id 與 centralized log backend。

## Background

Plain text log 對人類閱讀很直覺，但當多個 request 的 log 交錯時，很難穩定回答：

- 這一行 log 屬於哪一個 request？
- error 在哪一層第一次發生？
- API response failure 是否和 downstream failure 是同一件事？
- 怎麼用欄位查詢某個 user、order 或 correlation id？

Structured logging 的重點不是把 message 改成 JSON 而已，而是讓每一筆事件都帶有穩定欄位，例如 `requestId`、`correlationId`、`layer`、`event`、`outcome` 與 `durationMs`。

## Architecture

此 lab 是 script-only runtime，不啟動 Docker、DB、OpenTelemetry Collector 或 log backend。Experiment scripts 會在 process 內模擬：

```text
API handler
  -> checkout service
  -> order repository
  -> inventory downstream gateway
  -> success or error response
```

同一個 request context 會被傳過每一層。Plain log experiment 會丟失可查詢欄位；structured log experiment 會把相同 flow 輸出成 JSON events。

## Setup

此 lab 不需要啟動 infrastructure。

```bash
npm run lab:prepare -- observability/structured-logging
npm run lab:info -- observability/structured-logging
```

## Experiments

### plain-logs

```bash
npm run lab:run -- observability/structured-logging plain-logs
```

觀察重點：

- 多個 request 同時執行時，plain text logs 會交錯。
- message 可能看得懂，但缺少穩定欄位可以 machine filter。
- 診斷錯誤時只能靠時間順序與人工猜測。

### structured-logs

```bash
npm run lab:run -- observability/structured-logging structured-logs
```

觀察重點：

- 每筆 log 都帶 `requestId`、`correlationId`、`layer`、`event` 與 `outcome`。
- 可以用 `requestId` 查出單一 request timeline。
- 可以用 `layer`、`event` 或 `outcome` 聚合 request behavior。

### error-correlation

```bash
npm run lab:run -- observability/structured-logging error-correlation
```

觀察重點：

- Downstream error、service failure 與 API 502 response 共用同一個 `correlationId`。
- 第一個 error event 顯示 root failure layer。
- 後續 error events 顯示錯誤如何往上層傳播。

## Observation

查看 lab 模型摘要：

```bash
npm run lab:observe -- observability/structured-logging
```

每次 `lab:run` 會產生：

```text
labs/observability/structured-logging/runs/<run-id>/
├── metadata.json
└── output.log
```

產生 report：

```bash
npm run lab:report -- observability/structured-logging
```

## Expected Result

這個 lab 應該讓你看到：

- Plain text logs 在低併發時可讀，但在 request 交錯時不容易穩定查詢。
- Structured logs 讓 request flow 可以用欄位過濾，而不是用 fragile string search。
- `requestId` 適合代表單次 inbound request，`correlationId` 適合把跨層或跨 service 的相關事件串起來。
- Error diagnosis 應從同一個 correlation timeline 找第一個 failure event，而不是只看最後的 API 500/502。

## Trade-offs

| Design | 優點 | 代價 |
|---|---|---|
| Plain text logs | 寫起來快，人眼容易掃讀 | 缺少穩定欄位，查詢與聚合困難 |
| Structured JSON logs | 可被 log backend query、filter、aggregate | 需要定義 schema 與 context propagation |
| Context on every event | 診斷 request flow 可靠 | 欄位治理與敏感資料控管更重要 |

## Production Considerations

- 在 request entrypoint 建立或接收 `requestId` / `correlationId`，並傳遞到所有下游呼叫。
- Log schema 應穩定，避免每個團隊自行命名 `req_id`、`requestID`、`rid`。
- 不要把 password、token、完整信用卡、過量 payload 或 PII 放進 logs。
- Error log 應包含 error kind、message、safe metadata 與 correlation fields。
- Production 通常會把 log 與 trace 對齊，例如在 structured log 裡加入 `traceId` / `spanId`。

## Cleanup

此 lab 沒有外部 infrastructure，也沒有 persistent state。

```bash
npm run lab:down -- observability/structured-logging
```

## Promotion Candidate

目前不建議把 logger helper 抽到 `shared/` 或 `backend-forge-kit`。等 request metrics、OpenTelemetry tracing 與 centralized logging labs 都驗證後，再整理穩定的 observability baseline abstraction。
