# Project state

## App-user money history

Implemented locally:

- `GET /users/moneytransactionhistory`
- required app-user bearer JWT
- JWT-derived `userid` tenant/user scope
- unified wallet-recharge credits and charging-debit entries
- newest-first pagination with a maximum page size of 50
- optional `all`, `wallet_recharge`, and `charging_debit` filters
- current wallet balance and charging-session details
- a complete client-side PDF-generation payload for every charging debit,
  enriched from `UserBilling`, app-user, CPO-admin, and charger records where
  available
- no public or returned server filesystem path for billing PDFs
- OpenAPI visibility through `/swagger` and `/openapi.json` when enabled

Verified:

- focused identity, validation, pagination, enrichment, and authorization tests
- complete `npm test` suite
- JavaScript syntax checks
- Prisma schema validation
- API-documentation enabled/disabled registration tests

Not verified:

- live database execution of the new union query
- deployed endpoint behavior
- existing frontend integration

No database migration is required. The endpoint reads existing
`Transactionsdetails`, `TransactionHistory`, `Charingsessions`, `UserBilling`,
and `wallet` rows.

## Known documentation limitation

The OpenAPI inventory for unrelated legacy endpoints is incomplete. The new
money-history contract is explicitly covered and tested.
