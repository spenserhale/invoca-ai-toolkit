#!/usr/bin/env bun
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ErrorCode, EXIT_CODES } from "@invoca-toolkit/sdk";
import { allSpecs } from "../src/commandSpecs.js";
import { CLI_VERSION } from "../src/version.js";
import { registerRingPoolSpecs } from "../src/commands/ringpool/index.js";
import { registerBulkRingPoolSpecs } from "../src/commands/bulk-ringpool/index.js";
import { registerSignalSpecs } from "../src/commands/signal/index.js";
import { registerTransactionsSpecs } from "../src/commands/transactions/index.js";

registerRingPoolSpecs();
registerBulkRingPoolSpecs();
registerSignalSpecs();
registerTransactionsSpecs();

const out = resolve(__dirname, "..", "SKILL.md");

function md(): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("name: invoca");
  lines.push(`description: Drive the Invoca Platform API from the command line (v${CLI_VERSION})`);
  lines.push("---");
  lines.push("");
  lines.push("# invoca");
  lines.push("");
  lines.push(`Bun-compiled CLI for the Invoca Platform API. Version ${CLI_VERSION}.`);
  lines.push("");
  lines.push("## Configuration");
  lines.push("");
  lines.push("Set via env or saved profiles:");
  lines.push("");
  lines.push("- `INVOCA_OAUTH_TOKEN` — required for `signal` and `transactions` commands.");
  lines.push("- `INVOCA_NETWORK` — your network subdomain (e.g. `mynetwork` for `mynetwork.invoca.net`).");
  lines.push("- `INVOCA_BASE_URL_{RINGPOOL,PNAPI,SIGNAL,TRANSACTIONS}` — optional overrides (sandbox/testing).");
  lines.push("");
  lines.push("Or use `invoca profile save <name> --oauth-token ... --network ...` and `--profile <name>` on each call.");
  lines.push("");
  lines.push("## Output");
  lines.push("");
  lines.push("All data-returning commands accept `--toon` (default), `--json`, `--csv`, and `--deliver <stdout|file:<path>|webhook:<url>>`.");
  lines.push("");
  lines.push("## Exit codes");
  lines.push("");
  for (const code of Object.keys(ErrorCode)) {
    lines.push(`- \`${code}\` → exit ${EXIT_CODES[code as keyof typeof ErrorCode]}`);
  }
  lines.push("");
  lines.push("## Commands");
  lines.push("");
  for (const spec of allSpecs()) {
    lines.push(`### \`invoca ${spec.path.join(" ")}\``);
    lines.push("");
    lines.push(spec.brief);
    lines.push("");
    if (spec.positional && spec.positional.length > 0) {
      lines.push("Positional:");
      for (const p of spec.positional) lines.push(`- \`${p.name}\` — ${p.brief}`);
      lines.push("");
    }
    if (spec.flags && spec.flags.length > 0) {
      lines.push("Flags:");
      for (const f of spec.flags) {
        const reqStr = f.required ? " (required)" : "";
        const valStr = f.values ? ` [${f.values.join("|")}]` : "";
        lines.push(`- \`${f.name}\`${valStr}${reqStr} — ${f.brief}`);
      }
      lines.push("");
    }
    if (spec.examples && spec.examples.length > 0) {
      lines.push("Examples:");
      lines.push("");
      lines.push("```");
      for (const e of spec.examples) lines.push(e);
      lines.push("```");
      lines.push("");
    }
  }
  lines.push("## Introspection");
  lines.push("");
  lines.push("- `invoca agent-context --json` — emits the full machine-readable command schema.");
  lines.push("- `invoca <command> --help` — human-readable help.");
  return lines.join("\n");
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${md()}\n`);
console.log(`wrote ${out}`);
