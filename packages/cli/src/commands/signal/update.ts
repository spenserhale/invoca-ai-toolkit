import { buildCommand } from "@stricli/core";
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
import { buildSignalBody, signalFlags } from "./_shared.js";

interface Flags {
  readonly "transaction-id"?: string;
  readonly "call-record-id"?: string;
  readonly signal?: string;
  readonly custom?: string;
  readonly input?: string;
  readonly "call-in-progress": boolean;
  readonly "dry-run": boolean;
  readonly force: boolean;
  readonly "idempotency-key"?: string;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
}

export const signalUpdateCommand = buildCommand({
  docs: { brief: "Update (correct) signals or custom data on a call (PUT)" },
  parameters: {
    flags: {
      ...signalFlags,
      ...safetyFlags,
      ...idempotencyFlag,
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const body = await buildSignalBody(flags);

      if (flags["dry-run"]) {
        await emit({ status: "dry_run", method: "PUT", body }, flags);
        return;
      }

      const client = buildClient(flags);
      const result = await client.signal.update(body);
      await emit(result, flags);
    });
  },
});
