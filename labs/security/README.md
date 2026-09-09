# Security Labs

Security labs 用來建立 Backend Engineer 必要的 authentication、authorization、token、secret、audit、OWASP API security 與 multi-tenant security 能力。

## 預計情境實驗

| 優先級 | Lab | 目標 |
|---:|---|---|
| 1 | `security/rbac` | role、permission、authorization decision |
| 2 | `security/jwt-session` | access token、refresh token、revocation limitation |
| 3 | `security/oauth2-oidc-login` | delegated auth、identity token、callback flow |
| 4 | `security/password-hashing` | hashing、salt、work factor、credential migration |
| 5 | `security/rate-limit` | abuse control、burst、distributed limiter |
| 6 | `security/audit-log` | security event traceability、tamper concern |
| 7 | `security/multi-tenant-authorization` | tenant isolation、cross-tenant access prevention |
| 8 | `security/secret-management` | secret injection、rotation、leak response |
| 9 | `security/owasp-api-security` | common API vulnerabilities 與 mitigation |

## 工具 / 框架操作練習

- NestJS guard / interceptor / middleware
- JWT validation
- OAuth2 / OIDC provider integration
- password hashing libraries
- Redis-backed rate limiting
- audit log schema
- security test cases

## 建議整合情境

建立小型 Identity / Access demo：

```text
User
Role
Permission
Tenant
Session
Audit Log
```

## 設計原則

- Security lab 必須包含 abuse / bypass scenario，不只實作 happy path。
- Authorization decision 應可觀察、可測試、可稽核。
