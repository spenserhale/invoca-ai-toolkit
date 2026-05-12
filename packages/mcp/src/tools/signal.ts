import type { FastMCP } from "fastmcp";
import { z } from "zod";
import {
  InvocaClient,
  resolveConfig,
  SignalSearchSchema,
  SignalInputSchema,
  CustomDataItemSchema,
} from "@invoca-toolkit/sdk";

const SignalApplyParamsShape = z.object({
  search: SignalSearchSchema,
  signals: z.array(SignalInputSchema).optional(),
  custom_data: z.array(CustomDataItemSchema).optional(),
  partner_unique_id: z.string().optional(),
  occurred_at_time: z.string().optional(),
  call_in_progress: z.boolean().optional(),
});

function makeClient(): InvocaClient {
  return new InvocaClient(resolveConfig());
}

export function registerSignalTools(server: FastMCP): void {
  server.addTool({
    name: "signal_apply",
    description:
      "Apply signals and/or custom data to a specific call (transaction) using POST. " +
      "Use this for new signal applications. Requires at least one of transaction_id, call_record_id, or call_start_time in the search field, and at least one signal or custom_data entry.",
    parameters: SignalApplyParamsShape,
    execute: async (args) => {
      const client = makeClient();
      const result = await client.signal.apply(args);
      return JSON.stringify(result, null, 2);
    },
  });

  server.addTool({
    name: "signal_update",
    description:
      "Update (correct) existing signals or custom data on a specific call using PUT. " +
      "Signals are considered unique by name + partner_unique_id. Sending the same name + partner_unique_id as a previous request updates that signal and returns a corrects_transaction_id in the response. " +
      "Use this when correcting previously applied signal values.",
    parameters: SignalApplyParamsShape,
    execute: async (args) => {
      const client = makeClient();
      const result = await client.signal.update(args);
      return JSON.stringify(result, null, 2);
    },
  });
}
