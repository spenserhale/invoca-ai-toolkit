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

The CLI reads everything from env vars. The fastest path: add them to your
shell startup file (`~/.zshrc` on macOS, `~/.bashrc` on Linux) so they're set
in every new terminal session.

```sh
cat >> ~/.zshrc <<'EOF'
# Invoca CLI
export INVOCA_OAUTH_TOKEN="<your-raw-token>"   # no Bearer prefix — Invoca uses raw
export INVOCA_NETWORK="<your-subdomain>"       # e.g. "mynetwork" for mynetwork.invoca.net
export INVOCA_ROLE="advertiser"                # advertiser | network | affiliate
export INVOCA_ADVERTISER_ID="<your-id>"        # default --id for advertiser role
EOF

source ~/.zshrc
```

After that, `--as` and `--id` become optional — the CLI defaults to your
configured role and ID, so every command shortens to just its real work:

```sh
invoca transactions list --from 2026-05-01 --to 2026-05-12 --type Call
```

Pass `--as` / `--id` explicitly any time you need to look at a different
role for a single call. Run `invoca config show` to see exactly what got
resolved and from where (it never prints your token value):

```sh
$ invoca config show --json
{
  "role":          { "value": "advertiser", "source": "env", "env_var": "INVOCA_ROLE" },
  "advertiser_id": { "value": "217350",     "source": "env", "env_var": "INVOCA_ADVERTISER_ID" },
  "network":       { "value": "mynetwork",  "source": "env", "env_var": "INVOCA_NETWORK" },
  "oauth_token":   { "value": "<set>",      "source": "env", "env_var": "INVOCA_OAUTH_TOKEN" },
  ...
}
```

`source` is one of `flag`, `env`, `profile`, `default`, or `unset`. Anything
showing `unset` is a field you haven't configured — set the matching
`env_var` to fix it.

### Multiple environments — profiles

When you need to juggle creds across staging / prod / multiple accounts, save
each as a named profile and select with `--profile`:

```sh
invoca profile save prod --oauth-token <token> --network mynetwork
invoca transactions list --profile prod --from 2026-05-01 --to 2026-05-12
```

Profiles live at `~/.config/invoca/profiles.json` (XDG-aware, mode 0600).
Precedence on every command: **explicit flag > profile > env var**.

### Bash, fish, PowerShell

- **Bash:** the recipe above works as-is, swap `~/.zshrc` for `~/.bashrc`.
- **fish:** `set -Ux INVOCA_OAUTH_TOKEN "<token>"` (and one line per var).
- **PowerShell:** add `$env:INVOCA_OAUTH_TOKEN = "<token>"` to your `$PROFILE`.

## Most-used commands: transaction recovery

These three are what you reach for when a webhook miss leaves you needing to
reconstruct call history from Invoca:

### `transactions list` — find calls in a window

Assumes `INVOCA_ROLE=advertiser` + `INVOCA_ADVERTISER_ID` are set; otherwise
add `--as advertiser --id <your-id>` explicitly.

```sh
invoca transactions list \
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
invoca transactions get AC0E23E7-59B55738 --json
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
# (assumes INVOCA_ROLE=advertiser + INVOCA_ADVERTISER_ID are set in your shell)

# 1. Dump every Call transaction in the outage window. Include only the fields
#    you need so the payload is small and easy to scan.
invoca transactions list \
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
  invoca transactions download {} --to ./recordings/{}.mp3
```

The `-P4` runs four downloads in parallel — each one re-fetches its own
transaction, so no signed-URL expiration concerns even on large batches.

## Other command groups

- `invoca config show` — print resolved env / profile config, with source
  labels for every field. Token value is never displayed.
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
