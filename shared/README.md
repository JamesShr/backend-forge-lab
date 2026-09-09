# Shared Lab Utilities

`shared/` stores low-level support code that has repeated across multiple labs and does not carry scenario-specific meaning.

Keep these utilities boring:

- connection lifecycle
- wait / retry helpers
- transaction cleanup helpers
- common SQLSTATE formatting
- small observation helpers

Do not move lab schema, seed data, failure construction, experiment flow, or trade-off conclusions into `shared/`. Those belong in each lab so the scenario remains easy to read and reason about.

## Current Modules

```text
shared/
└── postgres/
    ├── client.ts
    ├── errors.ts
    └── runtime.ts
```

`shared/postgres` is intentionally small. It supports the current PostgreSQL labs without becoming a generic database framework.
