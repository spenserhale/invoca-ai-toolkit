import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { buildClient } from "../../lib/sdk.js";
import {
  formatFlags,
  profileFlag,
  deliverFlag,
  safetyFlags,
  idempotencyFlag,
} from "../../lib/flags.js";

const extraFlag = {
  extra: {
    kind: "parsed",
    parse: String,
    brief: "Extra query parameter in key=value form (repeatable)",
    optional: true,
    variadic: true,
  },
} as const;

interface Flags {
  readonly id: string;
  readonly key: string;
  readonly extra?: readonly string[];
  readonly "idempotency-key"?: string;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
  readonly "dry-run": boolean;
  readonly force: boolean;
}

function parseExtras(extra: readonly string[] | undefined): Record<string, string> {
  if (!extra) return {};
  const result: Record<string, string> = {};
  for (const entry of extra) {
    const eq = entry.indexOf("=");
    if (eq === -1) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: `--extra must be in the form key=value (got: "${entry}")`,
        got: entry,
      });
    }
    const k = entry.slice(0, eq);
    const v = entry.slice(eq + 1);
    if (!k) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: `--extra key must not be empty (got: "${entry}")`,
        got: entry,
      });
    }
    result[k] = v;
  }
  return result;
}

export const ringpoolAllocateCommand = buildCommand({
  docs: { brief: "Allocate a promo number from a RingPool" },
  parameters: {
    flags: {
      id: {
        kind: "parsed",
        parse: String,
        brief: "RingPool ID",
      } as const,
      key: {
        kind: "parsed",
        parse: String,
        brief: "RingPool authentication key (kept secret; never logged)",
      } as const,
      ...extraFlag,
      ...idempotencyFlag,
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
      ...safetyFlags,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const extras = parseExtras(flags.extra);

      if (flags["dry-run"]) {
        const redactedQuery: Record<string, string> = {
          ring_pool_key: "REDACTED",
          ...extras,
        };
        await emit(
          {
            status: "dry_run",
            would_call: "ringPool.allocate",
            url: `<network>.invoca.net/api/2015-12-09/ring_pools/${flags.id}/allocate_number.json`,
            query: redactedQuery,
          },
          flags,
        );
        return;
      }

      const client = buildClient(flags);
      const result = await client.ringPool.allocate({
        ringPoolId: flags.id,
        ringPoolKey: flags.key,
        ...extras,
      });
      await emit(result, flags);
    });
  },
});
