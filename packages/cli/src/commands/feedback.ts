import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { buildCommand } from "@stricli/core";
import { runCommand } from "../lib/errors.js";
import { emit } from "../lib/render.js";
import { feedbackLedgerPath } from "../lib/paths.js";
import { formatFlags, deliverFlag } from "../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const feedbackCommand = buildCommand({
  docs: { brief: "Record feedback locally; POSTs upstream if INVOCA_FEEDBACK_ENDPOINT is set" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ parse: String, brief: "Feedback text", placeholder: "text" }],
    },
    flags: { ...formatFlags, ...deliverFlag },
  },
  async func(this: void, flags: Flags, text: string) {
    await runCommand(async () => {
      const record = {
        timestamp: new Date().toISOString(),
        text,
        cli_version: process.env.npm_package_version ?? "unknown",
        argv: process.argv.slice(2),
      };
      const path = feedbackLedgerPath();
      mkdirSync(dirname(path), { recursive: true });
      appendFileSync(path, `${JSON.stringify(record)}\n`);

      let upstream: { ok: boolean; status?: number; error?: string } | undefined;
      const endpoint = process.env.INVOCA_FEEDBACK_ENDPOINT;
      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record),
          });
          upstream = { ok: res.ok, status: res.status };
        } catch (err) {
          upstream = { ok: false, error: err instanceof Error ? err.message : String(err) };
        }
      }
      await emit({ recorded: true, path, upstream }, flags);
    });
  },
});
