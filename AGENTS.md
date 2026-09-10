# AGENTS.md

本文件提供 agent 在 Backend Forge Lab 中探索、設計或實作 lab 時的閱讀順序。

## 通用原則

- 先理解 lab 要回答的工程問題，再修改程式或文件。
- 優先閱讀 `docs/` 中的導覽與規則，再進入特定 lab。
- 新增 lab 時應參考既有 `labs/database` 的實際結構，但不要把 PostgreSQL / Docker Compose 當成所有 runtime 的唯一形式。
- Scenario-specific schema、seed、failure construction、experiment flow 與 observation notes 應保留在各 lab。
- 只有跨兩到三個 labs 重複出現且形狀穩定的 helper，才考慮移到 `shared/`。

## Explore Existing Lab

當任務是理解、檢查、補文件或 review 既有 lab 時，依序閱讀：

1. `docs/README.md`
2. `docs/guide/README.md`
3. `docs/guide/lab/philosophy.md`
4. `docs/guide/lab/lab-initialization.md`
5. `docs/guide/lab/runner-lifecycle.md`
6. 目標 lab 的 `README.md`
7. 目標 lab 的 `lab.yaml`
8. 目標 lab 的 runtime config，例如 `docker-compose.yml`、`k8s/`、`helm/` 或 `terraform/`
9. 目標 lab 的 `experiments/`

若任務涉及目前進度或下一步排序，再閱讀：

1. `docs/task/README.md`
2. `docs/task/status/active-labs.md`
3. `docs/task/status/backlog.md`

## Implement New Lab

當任務是新增或大幅改造 lab 時，依序閱讀：

1. `docs/README.md`
2. `docs/proposal/README.md`
3. `docs/proposal/roadmap/levels.md`
4. `docs/proposal/roadmap/domains.md`
5. `docs/proposal/roadmap/stages.md`
6. `docs/guide/README.md`
7. `docs/guide/lab/philosophy.md`
8. `docs/guide/lab/lab-initialization.md`
9. `docs/guide/lab/manifest.md`
10. `docs/guide/lab/runner-lifecycle.md`
11. `docs/guide/lab/authoring-rules.md`
12. `docs/task/status/backlog.md`

如果 lab 涉及 cloud、Terraform 或可能產生成本的資源，還必須閱讀：

1. `docs/guide/lab/cloud-safety.md`

## Reference Existing Database Labs

建立 local PostgreSQL lab 時，優先參考：

1. `labs/database/transaction-isolation/`
2. `labs/database/concurrent-inventory/`
3. `labs/database/deadlock/`
4. `labs/database/locking/`
5. `labs/database/indexing-query-plan/`
6. `labs/database/connection-pool/`

這些 labs 展示目前的基本框架：

```text
README.md
lab.yaml
docker-compose.yml
experiments/
```

以及常見 experiment script 分工：

```text
db.ts
wait-for-db.ts
reset-data.ts
observe-state.ts
<experiment>.ts
```

## Implementation Checklist

新增 lab 前先確認：

- 工程問題是否明確。
- Lab id 是否採用 `<domain>/<scenario>`。
- `README.md` 是否說明 problem、learning goal、environment、experiments、observation 與 cleanup。
- `lab.yaml` 是否包含 domain、level、status、runtime、commands、experiments 與 cleanup。
- Runtime config 是否可由 runner lifecycle 操作。
- Experiment 是否真的重現行為，而不只是啟動 infrastructure。
- Destructive cleanup 是否需要 `--yes`。
- Generated output 是否不會被 commit。

## Verification

文件變更至少檢查：

```bash
git diff --check
```

Lab 或 runner 程式變更至少檢查：

```bash
npm run typecheck
```

若新增或修改 experiment，應在可行時實際執行對應 lab lifecycle 與 experiment，並確認 cleanup 可用。
