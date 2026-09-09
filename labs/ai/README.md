# AI Backend Labs

AI Backend labs 用來讓 Backend Engineer 能設計、整合與維運 AI application backend。重點不是訓練模型，而是 LLM API、structured output、tool calling、RAG、agent workflow、evaluation、guardrail、cost 與 observability。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `ai/structured-output` | schema-constrained response、validation、retry on invalid output |
| 2 | `ai/llm-api-gateway` | provider wrapper、timeout、retry、error mapping |
| 3 | `ai/streaming-response` | token streaming、client disconnect、partial output |
| 4 | `ai/tool-calling` | LLM tool call、backend capability boundary、result validation |
| 5 | `ai/rag-basic` | embedding、vector search、retrieval context |
| 6 | `ai/agent-workflow` | multi-step execution、state、tool failure |
| 7 | `ai/evaluation` | regression set、quality scoring、golden answers |
| 8 | `ai/guardrail` | output safety、action constraints、policy failure |
| 9 | `ai/token-cost-management` | token accounting、budget limit、cache |
| 10 | `ai/llm-observability` | latency、cost、model error、quality signal |

## 工具 / 框架操作練習

- LLM provider SDK
- JSON schema validation
- streaming HTTP / SSE
- vector database
- embedding pipeline
- evaluation dataset
- trace / metric instrumentation for AI calls
- MCP / tool interface 評估

## 建議整合情境

建立 `NestJS AI Gateway`：

```text
Client
  -> AI Gateway
  -> LLM Provider
  -> Tool Calling
  -> Internal API / Database
```

再逐步加入 RAG、agent workflow、evaluation 與 observability。

## 設計原則

- AI lab 要把 failure 明確化：invalid JSON、tool timeout、retrieval miss、high cost、unsafe output。
- 每個 experiment 應留下 prompt、model response、validation result 與 cost/latency observation。
