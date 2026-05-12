import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { buildClient } from "../../lib/sdk.js";
import { formatFlags, profileFlag, deliverFlag } from "../../lib/flags.js";
import { assertRole, fetchOne, roleFlags } from "./_shared.js";

interface Flags {
  readonly as: string;
  readonly id: string;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
}

export const transactionsGetCommand = buildCommand({
  docs: { brief: "Fetch a single transaction by its transaction_id" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          parse: String,
          brief: "Transaction ID (e.g. AC0E23E7-59B55738)",
          placeholder: "transaction_id",
        },
      ],
    },
    flags: {
      ...roleFlags,
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags, transactionId: string) {
    await runCommand(async () => {
      const role = assertRole(flags.as);
      const client = buildClient(flags);
      const transaction = await fetchOne(client, role, flags.id, transactionId);
      await emit(transaction, flags);
    });
  },
});
