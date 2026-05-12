# Invoca Toolkit

Invoca Platform Tools

A monorepo containing the SDK, CLI, and MCP server for the Invoca API.

## Packages

| Package | Description |
|---------|-------------|
| [`@invoca-toolkit/sdk`](./packages/sdk) | Core SDK with types, API client, and business logic |
| [`@invoca-toolkit/cli`](./packages/cli) | Command-line interface (Stricli) |
| [`@invoca-toolkit/mcp`](./packages/mcp) | MCP server for AI assistants (FastMCP) |

## Install the CLI

### Recommended: standalone binary

No Node.js, no npm, no PATH conflicts. One file.

**macOS and Linux:**

```sh
curl -fsSL https://raw.githubusercontent.com/spenserhale/invoca-ai-toolkit/main/scripts/install.sh | sh
```

The script detects your OS + architecture, downloads the matching binary from the latest release, verifies its SHA256, and installs to `$HOME/.local/bin/invoca`.

**Windows:** download `invoca-windows-x64.exe` from the [latest release](https://github.com/spenserhale/invoca-ai-toolkit/releases/latest) and put it on your `PATH`.

After install, run `invoca --help` or `invoca agent-context --json` to see every command.

## Configure the CLI

Set credentials + role defaults once in your shell startup file (`~/.zshrc`
for zsh, `~/.bashrc` for bash) so every new terminal session is ready:

```sh
cat >> ~/.zshrc <<'EOF'
# Invoca CLI
export INVOCA_OAUTH_TOKEN="<your-raw-token>"      # no Bearer prefix
export INVOCA_NETWORK="<your-subdomain>"          # e.g. "mynetwork"
export INVOCA_ROLE="advertiser"                   # advertiser | network | affiliate
export INVOCA_ADVERTISER_ID="<your-advertiser-id>"
EOF

source ~/.zshrc
```

`INVOCA_ROLE` + the matching `INVOCA_<ROLE>_ID` let you omit `--as` / `--id`
on every command. Override on a single call with `--as <role> --id <id>` when
you need to peek at a different role. Run `invoca config show` to see
exactly what got resolved. Full reference: [`packages/cli/README.md`](./packages/cli/README.md).

## Getting Started (from source)

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run the CLI
bun run dev:cli -- --help

# Run the MCP server (stdio mode for Claude Desktop)
bun run dev:mcp
```

## Architecture

```
packages/sdk/     <-- Types, API client, business logic (foundation)
    ^       ^
    |       |
packages/cli/   packages/mcp/
    (Stricli)    (FastMCP)
```

Both the CLI and MCP server are thin wrappers over the SDK. If the REST API
changes, you update the SDK and both consumers get the fix automatically.

## Development

```bash
# Run tests across all packages
bun test

# Build a specific package
cd packages/sdk && bun run build
```

## Adding a New API Operation

1. Add types to `packages/sdk/src/types.ts`
2. Add the client method to `packages/sdk/src/client.ts`
3. Add a CLI command in `packages/cli/src/commands/`
4. Add an MCP tool in `packages/mcp/src/tools/`
