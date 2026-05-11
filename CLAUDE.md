# Invoca Toolkit

Bun-based monorepo wrapping the Invoca Platform API. The SDK is the foundation; the CLI and MCP server are thin consumers.

## Layout

```
packages/sdk/   Zod-validated types, HTTP client, config resolver, typed errors
packages/cli/   Stricli CLI (binary: `invoca`) — wraps SDK
packages/mcp/   FastMCP server (stdio) — wraps SDK
```

Both `cli` and `mcp` depend on `@invoca-toolkit/sdk` via `workspace:*`. Add API operations to the SDK first; wire them through both consumers second.

## Toolchain

- **Runtime/bundler:** Bun (the CLI shebang is `#!/usr/bin/env bun`; sources are loaded directly, no transpile step in dev).
- **TypeScript:** strict, `noUncheckedIndexedAccess`, `noEmit` at the root. Each package extends the root `tsconfig.json`.
- **Schemas:** Zod for runtime validation of config, request params, and API responses.

## Commands

Run from the repo root unless noted.

```bash
bun install                     # install workspace deps
bun run build                   # build all packages
bun test                        # test all packages
bun run lint                    # tsc --noEmit across all packages
bun run clean                   # remove dist + node_modules

bun run dev:cli -- <args>       # run the CLI (e.g. -- resources list --json)
bun run dev:mcp                 # run the MCP server in stdio mode
```

Per-package: `bun run --filter @invoca-toolkit/<pkg> <script>`. The MCP package also has `bun run inspect` (FastMCP inspector).

## Configuration

`INVOCA_API_KEY` (required) and `INVOCA_BASE_URL` (defaults to `https://api.invoca.com`). Read via `resolveConfig()` from `@invoca-toolkit/sdk`. `.env.example` lives at the root; copy to `.env` for local dev.

## Conventions

- **Imports use `.js` extensions** in source files (ESM + bundler resolution). Keep this even though source is `.ts`.
- **All cross-package types come from the SDK's public exports** (`packages/sdk/src/index.ts`). Don't import from internal SDK paths.
- **Error types**: `InvocaError`, `InvocaAuthError`, `InvocaNotFoundError`. The HTTP client throws these; CLI commands catch and `process.exit(1)`, MCP tools let FastMCP serialize.
- **CLI output**: human-readable by default, `--json` flag for machine output. Mirror this pattern when adding commands.
- **MCP tools**: stringify JSON responses (`JSON.stringify(result, null, 2)`); FastMCP wraps the rest.

## Adding an API operation

1. Schema + type in `packages/sdk/src/types.ts` (Zod schema, then `z.infer`).
2. Method on `InvocaClient` in `packages/sdk/src/client.ts`.
3. Re-export new public types from `packages/sdk/src/index.ts`.
4. CLI command in `packages/cli/src/commands/<name>.ts`, registered in `packages/cli/src/app.ts` route map.
5. MCP tool in `packages/mcp/src/tools/resources.ts` (or a new file registered in `packages/mcp/src/index.ts`).

## Agent-native CLI

The `agent-native-cli-creator` skill is installed at `.agents/skills/agent-native-cli-creator/`. When extending the CLI, apply its patterns: non-interactive flags, structured output (`--json`), enumerated error codes, idempotent mutations, and three-layer introspection (`--help`, machine-readable schema, examples).
