# Runner Lifecycle

Repository root 提供統一 scenario runner。第一版透過 `package.json` scripts 與 TypeScript scripts 實作，後續可再演進成正式 CLI。

## Root Commands

README 只保留固定 pattern，不針對每個 lab 展開 command 清單。

```bash
npm run lab:list
npm run lab:info -- <lab-id>
npm run lab:up -- <lab-id>
npm run lab:run -- <lab-id> <experiment>
npm run lab:observe -- <lab-id>
npm run lab:down -- <lab-id>
npm run lab:report -- <lab-id>
```

## Common Lifecycle

所有 lab 儘量遵守共同生命週期：

```text
prepare
   ↓
up
   ↓
run
   ↓
observe
   ↓
down / destroy
```

| 階段 | 責任 |
|---|---|
| `prepare` | dependency check、environment check、image build、Terraform init、Helm dependency |
| `up` | 啟動 lab infrastructure |
| `run` | 執行 business scenario、failure scenario、load test 或 benchmark |
| `observe` | 觀察 logs、metrics、tracing、database state、queue state 或 infrastructure state |
| `down` | 停止 local infrastructure |
| `destroy` | 完全刪除 infrastructure |

## Runtime Adapter Design

Scenario runner 不應直接寫死不同 runtime 的細節。

```text
LabRuntimeAdapter
├── DockerComposeAdapter
├── KubernetesAdapter
├── HelmAdapter
├── TerraformAdapter
└── ScriptAdapter
```

統一介面概念：

```text
prepare()
up()
down()
destroy()
status()
logs()
```

Root CLI 的主要流程：

```text
read lab.yaml
    ↓
resolve runtime
    ↓
load adapter
    ↓
execute lifecycle
```
