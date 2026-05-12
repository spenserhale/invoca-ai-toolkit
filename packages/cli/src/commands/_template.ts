/**
 * Reference command skeleton. Copy + adapt for new commands.
 *
 * Every data-returning command must:
 *   1. accept the three format flags (--toon|--json|--csv)
 *   2. accept --deliver and route output via `emit()`
 *   3. accept --profile to load a named SDK config
 *   4. wrap its body in `runCommand(...)` so InvocaError exits cleanly
 * Mutation commands additionally:
 *   - accept --dry-run; return the would-be call shape without side effects
 *   - accept --force on destructive ops
 *   - accept --idempotency-key when retries can duplicate
 */
import { buildCommand } from "@stricli/core";
import { runCommand } from "../lib/errors.js";
import { emit } from "../lib/render.js";
import { buildClient } from "../lib/sdk.js";
import {
  formatFlags,
  profileFlag,
  deliverFlag,
  safetyFlags,
} from "../lib/flags.js";

interface ExampleFlags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
  readonly "dry-run": boolean;
}

export const exampleCommand = buildCommand({
  docs: { brief: "Example: replace this with a real command" },
  parameters: {
    flags: {
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
      ...safetyFlags,
    },
  },
  async func(this: void, flags: ExampleFlags) {
    await runCommand(async () => {
      if (flags["dry-run"]) {
        await emit({ status: "dry_run", would_call: "example.op" }, flags);
        return;
      }
      const client = buildClient(flags);
      await emit({ ok: true, client: !!client }, flags);
    });
  },
});
