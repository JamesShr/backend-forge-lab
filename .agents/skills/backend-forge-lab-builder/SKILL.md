---
name: backend-forge-lab-builder
description: Use when creating, extending, or implementing Backend Forge Lab scenarios. Follow this repo's docs/guide framework, choose the appropriate runtime shape, and initialize lab files consistently.
metadata:
  short-description: Build Backend Forge Lab scenarios
---

# Backend Forge Lab Builder

Use this skill for tasks that create, extend, or substantially implement a lab under `backend-forge-lab/labs/**`.

Keep this skill thin. The repository docs are the source of truth; this skill exists to route the agent to the right docs and preserve the lab initialization workflow.

## Required Reading

Before creating or substantially changing a lab, read:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/guide/README.md`
4. `docs/guide/lab/philosophy.md`
5. `docs/guide/lab/lab-initialization.md`
6. `docs/guide/lab/manifest.md`
7. `docs/guide/lab/runner-lifecycle.md`
8. `docs/guide/lab/authoring-rules.md`

If the task affects learning order, backlog, roadmap, or target level, also read:

1. `proposal/backend-skill-development-roadmap.md` when present
2. `docs/proposal/README.md`
3. `docs/proposal/roadmap/levels.md`
4. `docs/proposal/roadmap/domains.md`
5. `docs/proposal/roadmap/stages.md`
6. `docs/task/README.md`
7. `docs/task/status/backlog.md`
8. `docs/task/status/active-labs.md`

If the lab involves cloud, Terraform, billable resources, IAM, or deployment outside local development, also read:

1. `docs/guide/lab/cloud-safety.md`

## Runtime Selection

Choose the smallest runtime that can faithfully reproduce the engineering problem.

Use `docker-compose` when the lab needs local infrastructure such as PostgreSQL, Redis, Kafka, Prometheus, Grafana, or OpenTelemetry Collector.

Use Kubernetes manifests when the lab topic is Kubernetes behavior itself, such as pods, deployments, services, probes, scheduling, resource limits, rollout, rollback, or cluster troubleshooting.

Use Helm when the lab topic is packaged Kubernetes deployment, configurable releases, chart values, upgrade, rollback, or release lifecycle.

Use Terraform when the lab topic is cloud resources, IaC, AWS networking, ECS, RDS, IAM, managed services, or billable infrastructure. Apply the cloud safety guide before proposing or running any mutating cloud action.

Use script-only when the behavior can be reproduced locally without infrastructure.

Do not force Docker Compose onto Kubernetes, Helm, or Terraform labs. Preserve the same lab shape, but allow runtime-specific config folders such as `k8s/`, `manifests/`, `helm/`, `chart/`, or `terraform/`.

## Lab Shape

New labs should normally start with:

```text
labs/<domain>/<scenario>/
|-- README.md
|-- lab.yaml
|-- experiments/
`-- <runtime-config>
```

For local PostgreSQL labs, follow the established database baseline:

```text
labs/<domain>/<scenario>/
|-- README.md
|-- lab.yaml
|-- docker-compose.yml
`-- experiments/
    |-- db.ts
    |-- wait-for-db.ts
    |-- reset-data.ts
    |-- observe-state.ts
    `-- <experiment>.ts
```

Reference existing database labs before creating another local PostgreSQL lab:

1. `labs/database/transaction-isolation/`
2. `labs/database/concurrent-inventory/`
3. `labs/database/deadlock/`
4. `labs/database/locking/`
5. `labs/database/indexing-query-plan/`
6. `labs/database/connection-pool/`

## Design Rules

- Define the engineering problem before creating files.
- Use lab ids shaped as `<domain>/<scenario>`.
- Keep each lab focused on one main scenario.
- Prefer minimal infrastructure for L1/L2 labs.
- Add failure, load, observability, and trade-off depth when pushing a lab toward L3.
- Keep scenario-specific schema, seed, failure construction, experiment flow, and observation notes inside the lab.
- Move code to `shared/` only after the same stable pattern appears across two to three labs.
- Treat generated `runs/` and `reports/` output as non-source artifacts.

## Expected Deliverables

When implementing a new lab, produce the files needed for the selected runtime:

- `README.md` describing problem, learning goal, level, environment, setup, experiments, observation, and cleanup.
- `lab.yaml` describing domain, level, status, runtime, lifecycle command overrides, experiments, and cleanup safety.
- Runtime config such as `docker-compose.yml`, `k8s/`, `helm/`, or `terraform/` when needed.
- `experiments/` scripts that actually reproduce or observe behavior, not just start infrastructure.

## Verification

For documentation-only changes, run:

```bash
git diff --check
```

For TypeScript lab or runner changes, run:

```bash
npm run typecheck
```

When feasible, also run the relevant lab lifecycle and experiment commands, then confirm cleanup works.
