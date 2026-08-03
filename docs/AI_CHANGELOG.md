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

### Follow-up: frontend-generated billing PDF data

- Replaced the unusable internal `billing_pdf` path in the new money-history
  contract with a self-contained bill-generation object.
- Added customer, CPO issuer, charger, charging-session, payment, tax, total,
  and duration fields sourced from existing user-owned records.
- Charging debits now return derived bill data even before the asynchronous
  `UserBilling` row exists; stored bill values take precedence when available.
- Kept wallet recharge entries at `bill: null` because they are not charging
  bills.
