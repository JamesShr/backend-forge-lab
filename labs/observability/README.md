# Observability Labs

Observability labs 用來練習如何判斷系統是否健康，以及 production incident 發生時如何靠 logs、metrics、traces 定位問題。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `observability/structured-logging` | contextual log、request id、correlation id |
| 2 | `observability/otel-request-tracing` | OpenTelemetry tracing、service boundary、span attributes |
| 3 | `observability/prometheus-grafana` | metrics collection、dashboard、basic alert |
| 4 | `observability/latency-analysis` | p50 / p95 / p99、tail latency、dependency latency |
| 5 | `observability/load-testing` | throughput、error rate、capacity bottleneck |
| 6 | `observability/incident-runbook` | alert -> triage -> mitigation -> RCA |
| 7 | `observability/llm-observability` | AI backend latency、cost、quality signal |

## 工具 / 框架操作練習

- OpenTelemetry SDK / Collector
- Prometheus scrape config
- Grafana dashboard
- structured JSON logs
- request correlation middleware
- load testing scripts
- runbook / postmortem template

## 建議整合情境

從現有 database labs 或後續 service labs 加入 instrumentation，觀察 DB latency、retry 次數、error rate 與 request trace。

## 設計原則

- 不只展示 dashboard，要能回答「哪個 signal 讓我知道問題在哪裡」。
- L3 labs 應包含 failure、observable symptom、debug path 與 mitigation。
