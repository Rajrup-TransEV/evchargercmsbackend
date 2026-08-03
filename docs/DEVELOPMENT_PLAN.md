# Development plan

## Objective

Keep the deployed legacy CMS operational while adding only narrow,
compatibility-conscious fixes needed by the existing application. The new CMS
remains the long-term replacement; this repository is not a target for broad
architectural expansion.

## Permanent boundaries

- OCPP transport, live meters, and exact OCPP transaction IDs belong to the Go
  HAL.
- The CMS owns app-user identity, wallet effects, charging business history,
  and bills.
- Exact OCPP transaction IDs remain decimal strings across CMS boundaries.
- New app-user reads derive the user from a verified bearer token rather than a
  client-supplied user ID.

## Feature registry

### App-user money transaction history

Status: Implemented

Objective: Give the existing app one authenticated, paginated ledger combining
wallet recharge payments and charging debits, with relevant session and bill
details.

Implemented surfaces:

- `GET /users/moneytransactionhistory`
- bearer-token user scoping
- pagination and type filtering
- charging-session and bill enrichment
- OpenAPI and Swagger visibility
- focused and full Node test coverage

Remaining verification:

- Run the endpoint against a disposable or approved deployed database with an
  app-user token containing both recharge and charging-debit records.

## Next approved work

None. Additional legacy-CMS changes require an explicit request.

## Documentation remediation backlog

The existing Swagger/OpenAPI inventory covers only explicitly annotated routes.
Inventorying and documenting every legacy route remains deferred because it is
larger than the current compatibility slice.
