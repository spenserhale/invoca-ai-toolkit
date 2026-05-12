import { buildRouteMap } from "@stricli/core";
import { signalApplyCommand } from "./apply.js";
import { signalUpdateCommand } from "./update.js";
import { familySpecs, type FlagSpec } from "../../commandSpecs.js";

export const signalRoutes = buildRouteMap({
  routes: {
    apply: signalApplyCommand,
    update: signalUpdateCommand,
  },
  docs: { brief: "Apply or update signals on Invoca transactions" },
});

const SIGNAL_FLAGS: readonly FlagSpec[] = [
  { name: "--transaction-id", brief: "Transaction ID of the call leg", takesValue: true },
  { name: "--call-record-id", brief: "Call record ID of the complete call", takesValue: true },
  { name: "--signal", brief: 'Signal JSON: \'{"name":"sale","value":"true"}\' — repeat for multiple', takesValue: true },
  { name: "--custom", brief: 'Custom data JSON: \'{"name":"channel","value":"Paid Search"}\' — repeat for multiple', takesValue: true },
  { name: "--input", brief: "JSON file (or -) with signals[] and/or custom_data[] arrays", takesValue: true },
  { name: "--call-in-progress", brief: "Signal the call may still be in progress" },
  { name: "--dry-run", brief: "Validate; no side effects" },
  { name: "--idempotency-key", brief: "Caller key that dedupes retries", takesValue: true },
  { name: "--toon", brief: "Output as TOON (default)" },
  { name: "--json", brief: "Output as JSON" },
  { name: "--csv", brief: "Output as CSV (flat rows only)" },
  { name: "--deliver", brief: "Route output: stdout (default), file:<path>, webhook:<url>", takesValue: true },
  { name: "--profile", brief: "Named profile to load", takesValue: true },
];

export function registerSignalSpecs(): void {
  familySpecs.push(
    {
      path: ["signal", "apply"],
      brief: "Apply signals and/or custom data to a call (POST)",
      flags: SIGNAL_FLAGS,
      mutates: true,
      examples: [
        `invoca signal apply --transaction-id 00000000-00000001 --signal '{"name":"sale","value":"true"}' --json`,
        `invoca signal apply --call-record-id call-abc --custom '{"name":"channel","value":"Paid Search"}' --dry-run`,
        `invoca signal apply --transaction-id txn-1 --input ./signals.json`,
        `echo '{"signals":[{"name":"sale"}]}' | invoca signal apply --transaction-id txn-1 --input -`,
      ],
    },
    {
      path: ["signal", "update"],
      brief: "Update (correct) signals or custom data on a call (PUT)",
      flags: SIGNAL_FLAGS,
      mutates: true,
      examples: [
        `invoca signal update --transaction-id 00000000-00000001 --signal '{"name":"sale","partner_unique_id":"1","value":"false"}' --json`,
        `invoca signal update --call-record-id call-abc --signal '{"name":"quote"}' --dry-run`,
      ],
    },
  );
}
