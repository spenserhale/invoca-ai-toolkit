# `invoca` — Invoca Platform CLI

A single-binary CLI over the Invoca Platform API. Read transactions, allocate
RingPool numbers, apply call signals, and download call recordings.

Full schema reference: `invoca agent-context --json`. Generated workflow guide:
[`SKILL.md`](./SKILL.md).

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/spenserhale/invoca-ai-toolkit/main/scripts/install.sh | sh
```

Installs to `$HOME/.local/bin/invoca`. Verified by SHA256.

## Configure

Set two env vars (or save them in a profile):

```sh
export INVOCA_OAUTH_TOKEN=<your-raw-token>   # no Bearer prefix — Invoca uses raw
export INVOCA_NETWORK=mynetwork              # the subdomain before .invoca.net
```

Or save once and reference by name on every call:

```sh
invoca profile save prod --oauth-token <token> --network mynetwork
invoca transactions list --as advertiser --id 217350 --profile prod
```

Profiles live at `~/.config/invoca/profiles.json` (XDG-aware, mode 0600).

## Most-used commands: transaction recovery

These three are what you reach for when a webhook miss leaves you needing to
reconstruct call history from Invoca:

### `transactions list` — find calls in a window

```sh
invoca transactions list \
  --as advertiser --id 217350 \
  --from 2026-05-01 --to 2026-05-12 \
  --type Call \
  --include transaction_id,start_time_local,calling_phone_number,signal_name,recording \
  --limit 500 \
  --json \
  --deliver file:./calls.json
```

Lists transactions for a role within a date range. Common filters:

- `--type Call|Signal|Sale|PostCallEvent` — narrow by transaction type.
- `--include col,col` / `--exclude col,col` — trim the response to columns you
  care about. Faster + smaller; CSV-friendly.
- `--limit <n>` — defaults to 20. Max 4000 per page.
- `--cursor <last-transaction-id>` — page forward. The CLI's response always
  includes `truncated` and `next_cursor` so you know when to keep going.
- `--call-record-id <id>` — find all transactions tied to one call.

Tip: include `signal_name` and `signal_partner_unique_id` if you're auditing
which calls *should* have triggered your webhook — non-empty means Invoca
fired a signal.

### `transactions get` — fetch one transaction by id

```sh
invoca transactions get AC0E23E7-59B55738 --as advertiser --id 217350 --json
```

Sugar for `list --transaction-id <id>` that unwraps the single-element array
and errors with `E_NOT_FOUND` (exit 4) when the ID doesn't exist for that role.
The returned record includes `recording_download_url`, but treat it as
short-lived — it's a **pre-signed S3 URL with a 5-minute expiry**. If you're
going to download the audio, use `transactions download` instead, which
re-fetches just before streaming so the URL is always hot.

### `transactions download` — stream the call recording to disk

```sh
invoca transactions download AC0E23E7-59B55738 \
  --as advertiser --id 217350 \
  --to ./recordings/AC0E23E7-59B55738.mp3
```

Re-fetches the transaction (refreshes the signed URL), streams the MP3 to
`--to`, atomic-renames into place when complete. Refuses to overwrite an
existing file unless you pass `--force`. Supports `--dry-run` to preview the
target path without making a network call.

Exit codes: `0` success · `1` network error · `2` validation · `4` no
`recording_download_url` on the transaction · `5` auth.

## Webhook-failure recovery workflow

End-to-end example, the thing you'll actually do when a webhook outage
needs to be backfilled:

```sh
# 1. Dump every Call transaction in the outage window. Include only the fields
#    you need so the payload is small and easy to scan.
invoca transactions list \
  --as advertiser --id 217350 \
  --from 2026-05-08 --to 2026-05-10 \
  --type Call \
  --include transaction_id,start_time_local,calling_phone_number,duration,signal_name,signal_partner_unique_id,recording \
  --limit 4000 \
  --json --deliver file:./outage-window.json

# 2. Cross-reference against your DB to find which transaction_ids never
#    landed in your system. (Anything with a non-empty signal_name should
#    have hit your webhook.) Example with jq:
jq -r '.transactions[] | select(.signal_name != "" and .signal_name != null) | .transaction_id' \
  outage-window.json > expected-ids.txt
comm -23 <(sort expected-ids.txt) <(your-db-export | sort) > missed.txt

# 3. Pull recordings for the missed calls. Pipe the IDs through xargs.
mkdir -p ./recordings
cat missed.txt | xargs -I{} -P4 \
  invoca transactions download {} --as advertiser --id 217350 --to ./recordings/{}.mp3
```

The `-P4` runs four downloads in parallel — each one re-fetches its own
transaction, so no signed-URL expiration concerns even on large batches.

## Other command groups

- `invoca ringpool allocate` — single promo-number allocation.
- `invoca bulk-ringpool allocate` — batch allocate from a JSON input.
- `invoca signal apply|update` — write signals + custom data onto an existing
  transaction.
- `invoca jobs list|get|prune` — local jobs ledger (for `--idempotency-key`
  retries).
- `invoca profile save|list|show|delete` — named credential profiles.
- `invoca feedback "<text>"` — record local feedback; POSTs upstream if
  `INVOCA_FEEDBACK_ENDPOINT` is set.

## Output and delivery

All data commands accept:

- `--toon` (default), `--json`, `--csv` — output format. CSV rejects nested
  objects rather than silently flattening.
- `--deliver stdout|file:<path>|webhook:<url>` — atomic file writes or
  POST-and-respect-status webhooks.

## Errors

Errors carry an enumerated code and map to documented exit codes:

| code | exit | meaning |
|---|---|---|
| `E_AUTH` | 5 | token rejected or missing |
| `E_NOT_FOUND` | 4 | record doesn't exist for that role |
| `E_VALIDATION` | 2 | bad flag value, malformed input |
| `E_RATE_LIMIT` | 6 | back off and retry |
| `E_NETWORK` | 1 | upstream 5xx or transport failure |
| `E_TIMEOUT` | 1 | request exceeded `INVOCA_TIMEOUT_MS` |
| `E_CONFIG` | 3 | missing or invalid env / profile |
| `E_DRY_RUN` | 0 | `--dry-run` short-circuit, intentional |

## Programmatic schema

Every command, flag, and error code is also exposed structurally:

```sh
invoca agent-context --json
```

Used by `invoca` itself, by the bundled `SKILL.md` generator, and by anything
else that wants to discover the CLI without parsing `--help` text.
