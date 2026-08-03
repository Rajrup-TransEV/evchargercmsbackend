# App-user money transaction history

## Purpose

`GET /users/moneytransactionhistory` gives the signed-in app user one
newest-first, paginated money ledger. It combines:

- successful wallet recharge payments from `Transactionsdetails`; and
- completed charging debits from `TransactionHistory`.

It does not accept a `userid`. The backend derives the user from the verified
app-user JWT `userid` claim so one user cannot request another user's ledger.

## Request

```http
GET /users/moneytransactionhistory?page=1&limit=20&type=all
Authorization: Bearer <app-user-jwt>
```

Query parameters:

| Name | Required | Default | Rules |
| --- | --- | --- | --- |
| `page` | No | `1` | Positive integer. |
| `limit` | No | `20` | Positive integer from `1` through `50`. |
| `type` | No | `all` | `all`, `wallet_recharge`, or `charging_debit`. |

Do not send `userid` in the query, body, or headers.

## Successful response

Empty history is a successful `200` with `data: []`, `total: 0`, and
`total_pages: 0`.

```json
{
  "message": "Money transaction history fetched successfully",
  "wallet": {
    "id": "wallet-123",
    "current_balance": "477.50",
    "currency": "INR"
  },
  "data": [
    {
      "id": "transaction-public-id",
      "type": "CHARGING_DEBIT",
      "direction": "DEBIT",
      "amount": "22.50",
      "currency": "INR",
      "payment_id": "charge_9451203",
      "wallet_id": "wallet-123",
      "charger_id": "CP-001",
      "taxable_amount": "19.07",
      "gst_amount": "3.43",
      "created_at": "2026-08-03T03:00:00.000Z",
      "updated_at": "2026-08-03T03:00:00.000Z",
      "charging_session": {
        "session_id": "9451203",
        "charger_id": "CP-001",
        "started_at": "2026-08-03T02:00:00Z",
        "stopped_at": "2026-08-03T03:00:00Z",
        "meter_start_wh": "1000",
        "meter_stop_wh": "2250",
        "consumed_kwh": "1.25",
        "total_cost": "22.50"
      },
      "bill": {
        "id": "bill-public-id",
        "session_id": "9451203",
        "taxable_amount": "19.07",
        "gst_amount": "3.43",
        "total_amount": "22.50",
        "billing_pdf": "uploads/userbilling/bill.pdf"
      }
    },
    {
      "id": "recharge-public-id",
      "type": "WALLET_RECHARGE",
      "direction": "CREDIT",
      "amount": "500.00",
      "currency": "INR",
      "payment_id": "pay_example",
      "wallet_id": "wallet-123",
      "charger_id": null,
      "taxable_amount": null,
      "gst_amount": null,
      "created_at": "2026-08-02T12:00:00.000Z",
      "updated_at": "2026-08-02T12:00:00.000Z",
      "charging_session": null,
      "bill": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1,
    "has_previous": false,
    "has_next": false
  },
  "filter": {
    "type": "all"
  }
}
```

Money remains a decimal string because the legacy database stores monetary
values as strings. Frontend code must not use binary floating-point arithmetic
for settlement decisions.

For a charging debit, `charging_session` and `bill` may temporarily be `null`
if the related legacy row or asynchronous bill has not been created. The
financial debit remains valid and should still be displayed.

## Errors

| Status | Meaning |
| --- | --- |
| `400` | Invalid `page`, `limit`, or `type`. |
| `401` | Bearer token missing, invalid, expired, or missing an app-user `userid` claim. |
| `500` | The ledger could not be read. No raw database error is returned. |

## Ordering and consistency

Entries are ordered by creation time descending, then entry type and stable
source row ID descending. The total is calculated from the same two user-scoped
financial tables. Charging-session and bill details are read after the ledger
page, so a bill created concurrently can appear on a later refresh.

## Interactive API documentation

When `API_DOCS_ENABLED` is omitted or set to `true`, the implemented contract is
available at:

- `/swagger` for Swagger UI; and
- `/openapi.json` for the raw OpenAPI document.

Set `API_DOCS_ENABLED=false` and restart the process to leave both routes
unregistered. Do not enter production bearer tokens into shared Swagger UI
sessions.
