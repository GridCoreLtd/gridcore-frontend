# @gridcore/mock-api

A stand-in for the Go backend so the frontend can be built and its **error paths
exercised** before the real service exists.

Zero dependencies — plain Node. Data lives in [`db.json`](db.json) and is
re-read on every request, so you can edit it while the server runs.

```bash
pnpm mock            # from the repo root
# or
pnpm --filter @gridcore/mock-api dev
```

Listens on **http://localhost:4000**. Override with `PORT=4001`.

## Why not json-server

`json-server` serves CRUD over a JSON file, but it can't produce the error
shapes this frontend needs to handle — RFC 9457 `problem+json` with per-field
validation errors. Testing that a bad email lands under the *email input*
requires a server that can actually return that. This is ~400 lines and does.

Every response follows [architecture/10-api-errors.md](../../architecture/10-api-errors.md).

## Test accounts

| Email | Password | Role |
|---|---|---|
| `admin@gridcore.com` | `password123` | platform operator |
| `merchant@gridcore.com` | `password123` | merchant |
| `customer@gridcore.com` | `password123` | customer |

Sign-in accepts the phone number or the email. The mock returns a `scopes`
claim, which is what `apps/console/src/auth/scopes.ts` prefers.

## Triggering each error path

The point of this server is that you can reach every branch of the frontend's
error handling without editing code.

| To get | Do this |
|---|---|
| **422 with field errors** (should render *under the inputs*) | Register a merchant with `taken@example.com`, or short name `gridcore`, or website `notaurl` — combine them to get several at once |
| **422 on one field** | Verify OTP with any code other than `123456` |
| **Expired-code error** | Verify OTP with `000000` |
| **500 + traceId** (should toast with a reference) | Use any email containing `boom@` |
| **401** (should toast, never name a field) | Sign in with a wrong password |
| **400 malformed** | POST a body that isn't valid JSON |
| **404 with a helpful message** | Call any route the mock doesn't implement |
| **Network error / offline** | Stop the server and retry — the frontend distinguishes "offline" from "server unreachable" |
| **A slow request** | Use any email containing `slow@` (4s), or set `MOCK_LATENCY=2000` globally |

Default latency is 150 ms so loading states are visible. `MOCK_LATENCY=0` turns
it off.

### The validation response looks like this

```
POST /auth/register-merchant   { "email": "taken@example.com", "shortBusinessName": "gridcore", ... }

HTTP 422  application/problem+json
{
  "type": "https://api.gridcore.com/problems/validation_failed",
  "title": "Validation failed",
  "status": 422,
  "detail": "One or more fields need attention.",
  "instance": "/auth/register-merchant",
  "code": "validation_failed",
  "traceId": "mock-ms4o2dtx-2",
  "errors": [
    { "field": "email", "code": "already_registered", "message": "That email address is already registered." },
    { "field": "shortBusinessName", "code": "already_taken", "message": "That short name is taken. Try another." },
    { "field": "businessWebsite", "code": "invalid_format", "message": "Enter a full URL, including https://" }
  ]
}
```

Note it reports **all three failures at once**. Returning only the first would
force the user through one round-trip per mistake — the Go service must do the
same.

## Uploads

`POST /uploads/presign` returns a presigned-style pair pointing back at the mock,
so the frontend's upload flow runs end to end. Bytes are discarded.

Uploads are currently switched **off** in the apps (`UPLOADS_ENABLED = false` —
see the monorepo README). Flip that to `true` to test against this mock.

## Coverage

Implemented in full: merchant onboarding (countries, send/verify OTP, register),
auth (login, `/users/me`, `/merchants/me`, change password), presigned uploads,
and the reference/collection reads the console and customer apps need to boot
(banks, roles, meter brands/types, merchants, users, meters, transactions,
topups, payout schedules, summaries).

Anything else returns a 404 whose `detail` names the missing route and tells you
where to add it. That's deliberate — a silent empty 200 would hide the gap.

Adding a route is one entry in the `routes` array in
[`server.mjs`](server.mjs); simple reads need no handler at all:

```js
{ method: "GET", path: "/payments/get-banks", key: "banks" },
{ method: "GET", path: "/merchants", key: "merchants", paginated: true },
```
