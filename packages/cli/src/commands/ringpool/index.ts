import { buildRouteMap } from "@stricli/core";
import { ringpoolAllocateCommand } from "./allocate.js";
import { familySpecs, type CommandSpec } from "../../commandSpecs.js";

export const ringpoolRoutes = buildRouteMap({
  routes: {
    allocate: ringpoolAllocateCommand,
  },
  docs: { brief: "Allocate dynamic promo numbers from a RingPool" },
});

const ringpoolSpecs: CommandSpec[] = [
  {
    path: ["ringpool", "allocate"],
    brief: "Allocate a promo number from a RingPool",
    flags: [
      { name: "--id", brief: "RingPool ID", required: true, takesValue: true },
      { name: "--key", brief: "RingPool authentication key", required: true, takesValue: true },
      { name: "--extra", brief: "Extra query param key=value (repeatable)", takesValue: true },
      { name: "--idempotency-key", brief: "Deduplicate retried calls under this key", takesValue: true },
      { name: "--dry-run", brief: "Validate; no side effects" },
      { name: "--toon", brief: "Output as TOON (default)" },
      { name: "--json", brief: "Output as JSON" },
      { name: "--csv", brief: "Output as CSV" },
      { name: "--deliver", brief: "Route output: stdout (default), file:<path>, webhook:<url>", takesValue: true },
      { name: "--profile", brief: "Named profile to load", takesValue: true },
    ],
    examples: [
      "invoca ringpool allocate --id 16 --key <KEY>",
      "invoca ringpool allocate --id 16 --key <KEY> --extra param1=homepage --extra pid=5567 --json",
      "invoca ringpool allocate --id 16 --key <KEY> --dry-run",
    ],
    mutates: false,
  },
];

export function registerRingPoolSpecs(): void {
  for (const spec of ringpoolSpecs) {
    familySpecs.push(spec);
  }
}
