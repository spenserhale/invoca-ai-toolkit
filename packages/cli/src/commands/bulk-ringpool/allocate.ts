import { buildCommand } from "@stricli/core";
import { readFileSync } from "node:fs";
import { InvocaError, type BulkRingPoolAllocateRequest } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { buildClient } from "../../lib/sdk.js";
import { startJob, finishJob } from "../../lib/jobs.js";
import {
  formatFlags,
  safetyFlags,
  waitFlag,
  idempotencyFlag,
  deliverFlag,
  profileFlag,
} from "../../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly "dry-run": boolean;
  readonly force: boolean;
  readonly wait: boolean;
  readonly "idempotency-key"?: string;
  readonly deliver?: string;
  readonly profile?: string;
  readonly input: string;
}

function readInput(input: string): BulkRingPoolAllocateRequest[] {
  let raw: string;
  if (input === "-") {
    raw = readFileSync("/dev/stdin", "utf8");
  } else {
    raw = readFileSync(input, "utf8");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (cause) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `--input is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
      hint: "Provide a JSON array of request objects",
      cause,
    });
  }
  if (!Array.isArray(parsed)) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: "--input must be a JSON array",
      hint: "Each element needs ring_pool_id and ring_pool_key",
    });
  }
  return parsed as BulkRingPoolAllocateRequest[];
}

export const bulkRingpoolAllocateCommand = buildCommand({
  docs: { brief: "Batch-allocate promo numbers across one or more RingPools" },
  parameters: {
    flags: {
      ...formatFlags,
      ...safetyFlags,
      ...waitFlag,
      ...idempotencyFlag,
      ...deliverFlag,
      ...profileFlag,
      input: {
        kind: "parsed",
        parse: String,
        brief: "Path to JSON array file, or - for stdin",
      },
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const requests = readInput(flags.input);

      if (flags["dry-run"]) {
        const sample = requests[0]
          ? { ...requests[0], ring_pool_key: "REDACTED" }
          : undefined;
        await emit(
          { status: "dry_run", count: requests.length, sample },
          flags,
        );
        return;
      }

      const iKey = flags["idempotency-key"];
      const job = startJob("bulk-ringpool allocate", iKey);
      if (iKey && job.status !== "pending") {
        await emit(
          { job_id: job.id, status: job.status, summary: job.summary },
          flags,
        );
        return;
      }

      const client = buildClient(flags);
      const results = await client.bulkRingPool.allocate(requests);
      finishJob(job.id, "succeeded", `${results.length} allocations`);

      await emit({ count: results.length, allocations: results }, flags);
    });
  },
});
