import { buildRouteMap } from "@stricli/core";
import { bulkRingpoolAllocateCommand } from "./allocate.js";
import { familySpecs, type CommandSpec } from "../../commandSpecs.js";

export const bulkRingpoolRoutes = buildRouteMap({
  routes: { allocate: bulkRingpoolAllocateCommand },
  docs: { brief: "Batch promo-number allocation across RingPools" },
});

const BULK_RINGPOOL_SPECS: CommandSpec[] = [
  {
    path: ["bulk-ringpool", "allocate"],
    brief: "Batch-allocate promo numbers across one or more RingPools",
    flags: [
      {
        name: "--input",
        brief: "Path to JSON array file, or - for stdin",
        required: true,
        takesValue: true,
      },
      { name: "--dry-run", brief: "Validate; no side effects" },
      { name: "--force", brief: "Bypass destructive-op guard" },
      {
        name: "--wait",
        brief: "Accept flag (API is synchronous; no-op for this operation)",
      },
      {
        name: "--idempotency-key",
        brief: "Caller key that dedupes retries via the local jobs ledger",
        takesValue: true,
      },
      { name: "--toon", brief: "Output as TOON (default)" },
      { name: "--json", brief: "Output as JSON" },
      { name: "--csv", brief: "Output as CSV (flat rows only)" },
      {
        name: "--deliver",
        brief: "Route output: stdout (default), file:<path>, webhook:<url>",
        takesValue: true,
        values: ["stdout", "file:<path>", "webhook:<url>"],
      },
      {
        name: "--profile",
        brief: "Named profile to load (see `invoca profile list`)",
        takesValue: true,
      },
    ],
    examples: [
      "invoca bulk-ringpool allocate --input requests.json --json",
      "invoca bulk-ringpool allocate --input - < requests.json --dry-run",
      "invoca bulk-ringpool allocate --input requests.json --idempotency-key run-001 --json",
    ],
    mutates: true,
    async: false,
  },
];

export function registerBulkRingPoolSpecs(): void {
  familySpecs.push(...BULK_RINGPOOL_SPECS);
}
