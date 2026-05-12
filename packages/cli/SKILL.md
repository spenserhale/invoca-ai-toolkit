---
name: invoca
description: Drive the Invoca Platform API from the command line (v0.1.0)
---

# invoca

Bun-compiled CLI for the Invoca Platform API. Version 0.1.0.

## Configuration

Set via env or saved profiles:

- `INVOCA_OAUTH_TOKEN` — required for `signal` and `transactions` commands.
- `INVOCA_NETWORK` — your network subdomain (e.g. `mynetwork` for `mynetwork.invoca.net`).
- `INVOCA_BASE_URL_{RINGPOOL,PNAPI,SIGNAL,TRANSACTIONS}` — optional overrides (sandbox/testing).

Or use `invoca profile save <name> --oauth-token ... --network ...` and `--profile <name>` on each call.

## Output

All data-returning commands accept `--toon` (default), `--json`, `--csv`, and `--deliver <stdout|file:<path>|webhook:<url>>`.

## Exit codes

- `E_NETWORK` → exit 1
- `E_TIMEOUT` → exit 1
- `E_VALIDATION` → exit 2
- `E_CONFIG` → exit 3
- `E_NOT_FOUND` → exit 4
- `E_AUTH` → exit 5
- `E_RATE_LIMIT` → exit 6
- `E_DRY_RUN` → exit 0

## Commands

### `invoca agent-context`

Emit a machine-readable description of every command, flag, and error code

Flags:
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

Examples:

```
invoca agent-context --json | jq '.schema_version'
```

### `invoca profile save`

Create or overwrite a named profile

Positional:
- `name` — Profile name

Flags:
- `--oauth-token` — OAuth token
- `--network` — Network subdomain
- `--timeout-ms` — Request timeout (ms)
- `--user-agent` — User-Agent header
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

Examples:

```
invoca profile save staging --oauth-token sk_... --network demo
```

### `invoca profile list`

List saved profile names

Flags:
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca profile show`

Show a profile (secrets redacted unless --reveal)

Positional:
- `name` — Profile name

Flags:
- `--reveal` — Include secrets in plain text
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca profile delete`

Delete a saved profile (--force required)

Positional:
- `name` — Profile name

Flags:
- `--force` — Bypass destructive-op guard
- `--dry-run` — Validate; no side effects
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca jobs list`

List jobs from the local ledger (newest first, bounded)

Flags:
- `--limit` — Page size
- `--cursor` — Pagination cursor
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca jobs get`

Get a job by ID

Positional:
- `id` — Job ID

Flags:
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca jobs prune`

Drop ledger entries older than a duration (--force required)

Flags:
- `--older-than` (required) — Duration <n><s|m|h|d>
- `--force` — Bypass destructive-op guard
- `--dry-run` — Validate; no side effects
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca feedback`

Record feedback locally; POSTs upstream when INVOCA_FEEDBACK_ENDPOINT is set

Positional:
- `text` — Feedback message

Flags:
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` [stdout|file:<dest>|webhook:<dest>] — Route output: stdout (default), file:<path>, webhook:<url>

### `invoca ringpool allocate`

Allocate a promo number from a RingPool

Flags:
- `--id` (required) — RingPool ID
- `--key` (required) — RingPool authentication key
- `--extra` — Extra query param key=value (repeatable)
- `--idempotency-key` — Deduplicate retried calls under this key
- `--dry-run` — Validate; no side effects
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV
- `--deliver` — Route output: stdout (default), file:<path>, webhook:<url>
- `--profile` — Named profile to load

Examples:

```
invoca ringpool allocate --id 16 --key <KEY>
invoca ringpool allocate --id 16 --key <KEY> --extra param1=homepage --extra pid=5567 --json
invoca ringpool allocate --id 16 --key <KEY> --dry-run
```

### `invoca bulk-ringpool allocate`

Batch-allocate promo numbers across one or more RingPools

Flags:
- `--input` (required) — Path to JSON array file, or - for stdin
- `--dry-run` — Validate; no side effects
- `--force` — Bypass destructive-op guard
- `--wait` — Accept flag (API is synchronous; no-op for this operation)
- `--idempotency-key` — Caller key that dedupes retries via the local jobs ledger
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV (flat rows only)
- `--deliver` [stdout|file:<path>|webhook:<url>] — Route output: stdout (default), file:<path>, webhook:<url>
- `--profile` — Named profile to load (see `invoca profile list`)

Examples:

```
invoca bulk-ringpool allocate --input requests.json --json
invoca bulk-ringpool allocate --input - < requests.json --dry-run
invoca bulk-ringpool allocate --input requests.json --idempotency-key run-001 --json
```

### `invoca signal apply`

Apply signals and/or custom data to a call (POST)

Flags:
- `--transaction-id` — Transaction ID of the call leg
- `--call-record-id` — Call record ID of the complete call
- `--signal` — Signal JSON: '{"name":"sale","value":"true"}' — repeat for multiple
- `--custom` — Custom data JSON: '{"name":"channel","value":"Paid Search"}' — repeat for multiple
- `--input` — JSON file (or -) with signals[] and/or custom_data[] arrays
- `--call-in-progress` — Signal the call may still be in progress
- `--dry-run` — Validate; no side effects
- `--idempotency-key` — Caller key that dedupes retries
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV (flat rows only)
- `--deliver` — Route output: stdout (default), file:<path>, webhook:<url>
- `--profile` — Named profile to load

Examples:

```
invoca signal apply --transaction-id 00000000-00000001 --signal '{"name":"sale","value":"true"}' --json
invoca signal apply --call-record-id call-abc --custom '{"name":"channel","value":"Paid Search"}' --dry-run
invoca signal apply --transaction-id txn-1 --input ./signals.json
echo '{"signals":[{"name":"sale"}]}' | invoca signal apply --transaction-id txn-1 --input -
```

### `invoca signal update`

Update (correct) signals or custom data on a call (PUT)

Flags:
- `--transaction-id` — Transaction ID of the call leg
- `--call-record-id` — Call record ID of the complete call
- `--signal` — Signal JSON: '{"name":"sale","value":"true"}' — repeat for multiple
- `--custom` — Custom data JSON: '{"name":"channel","value":"Paid Search"}' — repeat for multiple
- `--input` — JSON file (or -) with signals[] and/or custom_data[] arrays
- `--call-in-progress` — Signal the call may still be in progress
- `--dry-run` — Validate; no side effects
- `--idempotency-key` — Caller key that dedupes retries
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV (flat rows only)
- `--deliver` — Route output: stdout (default), file:<path>, webhook:<url>
- `--profile` — Named profile to load

Examples:

```
invoca signal update --transaction-id 00000000-00000001 --signal '{"name":"sale","partner_unique_id":"1","value":"false"}' --json
invoca signal update --call-record-id call-abc --signal '{"name":"quote"}' --dry-run
```

### `invoca transactions list`

List transactions for an advertiser, network, or affiliate

Flags:
- `--as` [advertiser|network|affiliate] (required) — Role: advertiser, network, or affiliate
- `--id` (required) — Advertiser, network, or affiliate ID
- `--from` — Start date (YYYY-MM-DD, inclusive)
- `--to` — End date (YYYY-MM-DD, inclusive)
- `--limit` — Maximum number of transactions (default: 20)
- `--cursor` — Pagination cursor (start_after_transaction_id)
- `--include` — Comma-separated columns to include
- `--exclude` — Comma-separated columns to exclude
- `--type` [Call|PostCallEvent|Sale|Signal] — Filter by type: Call, PostCallEvent, Sale, Signal
- `--transaction-id` — Filter to a specific transaction ID
- `--call-record-id` — Filter to transactions for a specific call
- `--toon` — Output as TOON (default)
- `--json` — Output as JSON
- `--csv` — Output as CSV (flat rows only)
- `--deliver` — Route output: stdout (default), file:<path>, webhook:<url>
- `--profile` — Named profile to load

Examples:

```
invoca transactions list --as advertiser --id 123 --from 2024-01-01 --to 2024-01-31 --json
invoca transactions list --as network --id 456 --limit 50 --cursor TXN-LAST-ID
invoca transactions list --as affiliate --id 789 --type Signal
```

## Introspection

- `invoca agent-context --json` — emits the full machine-readable command schema.
- `invoca <command> --help` — human-readable help.
