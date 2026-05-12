import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { pruneJobs } from "../../lib/jobs.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag, safetyFlags } from "../../lib/flags.js";

interface Flags {
  readonly "older-than": string;
  readonly force: boolean;
  readonly "dry-run": boolean;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

const DURATION = /^(\d+)\s*(s|m|h|d)$/;

function parseDuration(input: string): number {
  const m = DURATION.exec(input.trim());
  if (!m) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `--older-than expects a duration like 30s, 5m, 2h, 7d`,
      got: input,
    });
  }
  const n = parseInt(m[1]!, 10);
  const unit = m[2]!;
  const mult: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * mult[unit]!;
}

export const jobsPruneCommand = buildCommand({
  docs: { brief: "Delete ledger entries older than the given duration" },
  parameters: {
    flags: {
      "older-than": {
        kind: "parsed",
        parse: String,
        brief: "Duration: <number><s|m|h|d> (e.g. 7d)",
      },
      ...safetyFlags,
      ...formatFlags,
      ...deliverFlag,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const ms = parseDuration(flags["older-than"]);
      if (!flags.force && !flags["dry-run"]) {
        throw new InvocaError({
          code: "E_VALIDATION",
          message: "jobs prune is destructive; pass --force to confirm",
          hint: "or use --dry-run to preview",
        });
      }
      if (flags["dry-run"]) {
        await emit({ status: "dry_run", older_than_ms: ms }, flags);
        return;
      }
      const removed = pruneJobs(ms);
      await emit({ removed }, flags);
    });
  },
});
