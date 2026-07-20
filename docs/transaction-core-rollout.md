# Charging transaction core rollout

This change preserves the existing `/users` routes and response fields while
making the OCPP transaction ID the lifecycle key.

Frontend integration, request/response contracts, TypeScript models, polling,
and UI behavior are documented in
[`frontend-charging-session-api.md`](./frontend-charging-session-api.md).

## Identity map

- `User` is the passenger/mobile-app identity.
- `UserProfile` is a staff/admin identity.
- A wallet may belong to either through `appuserrelatedwallet` or
  `userprofilerelatedwallet`. Charging policy requires exactly one matching
  wallet and does not infer identity from table names.

## Deployment order

1. Put CMS charging writes into a short maintenance window. Do not migrate while
   a charger-originated StartTransaction is waiting to reach CMS. Existing
   sessions may remain connected; step 7 reconciles their exact IDs.
2. Back up the MySQL database.
3. Deploy the code but keep the old process running.
4. Run `npm ci`.
5. Run `npm run preflight:transaction-core`. Stop if it reports any duplicate or
   malformed keys; reconcile them explicitly instead of deleting arbitrary rows.
6. Run `npm run migrate:deploy`.
7. Run `npm run prisma:generate`.
8. With the Go HAL reachable, run `npm run reconcile:active-transactions`.
   It promotes only exact IDs currently reported by the HAL from `UNKNOWN` to
   `ACTIVE`. It never guesses that an unmatched row is complete.
9. Start one CMS instance and verify logs contain `Charging lifecycle workers
   started`.
10. Exercise the acceptance matrix below, then return all instances to service.

The migration marks only rows with an exact `Charingsessions.sessionid` match as
`COMPLETED`. Other historical rows become `UNKNOWN`; they are not presented as
live and are not silently completed.

## Compatibility and cutover

`POST /users/getongoingtransaction` retains its existing response and now puts
the exact `transactionid` in `manual_stop.body`.

`POST /users/chargerstop` should receive `chargerid`, `userid`, and
`transactionid`. For older callers, omission of `transactionid` remains
temporarily supported only when exactly one explicit current transaction
matches. Set `ALLOW_LEGACY_TRANSACTION_IDENTITY=false` after downstream clients
send bearer tokens. Until then, legacy body identity is logged in the response
as `identity_source: legacy_body`.

The completion callback returns the historic numeric `bill_result: 1`, plus
`billing_status: queued`. PDF creation is durable and asynchronous.

## Worker settings

- `CHARGING_WORKERS_ENABLED` defaults to `true`.
- `CHARGING_WORKER_INTERVAL_MS` defaults to `30000`.
- `STOP_RETRY_MAX_ATTEMPTS` defaults to `10`.
- `OCPP_HTTP_TIMEOUT_MS` defaults to `15000`.
- `START_INTENT_TTL_MS` defaults to `600000` and prevents concurrent duplicate
  remote-start requests while the authoritative StartTransaction callback is in
  flight.

## Acceptance matrix

- normal start, charger stop, completion, bill
- exact manual stop and automatic max-kWh stop
- duplicated/concurrent start callback
- duplicated/concurrent completion callback (one deduction, one session/history)
- completion with zero consumption
- stop accepted but completion delayed
- OCPP HAL unreachable during stop, then recovered
- CMS unavailable during both start and completion callbacks, then recovered
- simultaneous completion and Razorpay/admin recharge
- transaction-ID collision with a different user/charger (must return 409)
- unknown historical transaction (must not be shown as active)
- bearer token for another user (must return 403)

Do not infer completion from a RemoteStop acknowledgement. Only the
charger-originated completion callback changes lifecycle state to `COMPLETED`.
