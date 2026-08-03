# AI-assisted changelog

## 2026-08-03 — App-user money transaction history

- Added bearer-scoped `GET /users/moneytransactionhistory`.
- Combined wallet recharge payments and charging debits into one paginated
  newest-first response.
- Added charging-session, bill, and current-wallet enrichment without changing
  the database schema.
- Added strict bearer identity resolution for app-user-owned reads.
- Registered the endpoint in OpenAPI and added environment-controlled Swagger
  UI plus raw `/openapi.json` serving.
- Added frontend integration documentation and repository documentation index.
- Verified focused tests, the complete Node test suite, JavaScript syntax, and
  Prisma schema validity.
- Live database and deployed endpoint verification remain pending.
