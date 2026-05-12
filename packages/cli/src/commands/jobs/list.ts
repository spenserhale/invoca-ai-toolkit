import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { listJobs } from "../../lib/jobs.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag, paginationFlags, DEFAULT_LIST_LIMIT } from "../../lib/flags.js";

interface Flags {
  readonly limit?: number;
  readonly cursor?: string;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const jobsListCommand = buildCommand({
  docs: { brief: "List jobs from the local ledger (newest first)" },
  parameters: { flags: { ...paginationFlags, ...formatFlags, ...deliverFlag } },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const all = listJobs().reverse();
      const start = flags.cursor ? Math.max(0, parseInt(flags.cursor, 10) || 0) : 0;
      const limit = flags.limit ?? DEFAULT_LIST_LIMIT;
      const slice = all.slice(start, start + limit);
      const next = start + slice.length;
      await emit(
        {
          jobs: slice,
          total: all.length,
          truncated: next < all.length,
          next_cursor: next < all.length ? String(next) : undefined,
        },
        flags,
      );
    });
  },
});
