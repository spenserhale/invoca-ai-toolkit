import { buildRouteMap } from "@stricli/core";
import { transactionsListCommand } from "./list.js";
import { familySpecs } from "../../commandSpecs.js";

export const transactionsRoutes = buildRouteMap({
  routes: { list: transactionsListCommand },
  docs: { brief: "Read transaction history for advertiser, network, or affiliate" },
});

export function registerTransactionsSpecs(): void {
  familySpecs.push({
    path: ["transactions", "list"],
    brief: "List transactions for an advertiser, network, or affiliate",
    flags: [
      { name: "--as", brief: "Role: advertiser, network, or affiliate", takesValue: true, required: true, values: ["advertiser", "network", "affiliate"] },
      { name: "--id", brief: "Advertiser, network, or affiliate ID", takesValue: true, required: true },
      { name: "--from", brief: "Start date (YYYY-MM-DD, inclusive)", takesValue: true },
      { name: "--to", brief: "End date (YYYY-MM-DD, inclusive)", takesValue: true },
      { name: "--limit", brief: "Maximum number of transactions (default: 20)", takesValue: true, default: "20" },
      { name: "--cursor", brief: "Pagination cursor (start_after_transaction_id)", takesValue: true },
      { name: "--include", brief: "Comma-separated columns to include", takesValue: true },
      { name: "--exclude", brief: "Comma-separated columns to exclude", takesValue: true },
      { name: "--type", brief: "Filter by type: Call, PostCallEvent, Sale, Signal", takesValue: true, values: ["Call", "PostCallEvent", "Sale", "Signal"] },
      { name: "--transaction-id", brief: "Filter to a specific transaction ID", takesValue: true },
      { name: "--call-record-id", brief: "Filter to transactions for a specific call", takesValue: true },
      { name: "--toon", brief: "Output as TOON (default)" },
      { name: "--json", brief: "Output as JSON" },
      { name: "--csv", brief: "Output as CSV (flat rows only)" },
      { name: "--deliver", brief: "Route output: stdout (default), file:<path>, webhook:<url>", takesValue: true },
      { name: "--profile", brief: "Named profile to load", takesValue: true },
    ],
    examples: [
      "invoca transactions list --as advertiser --id 123 --from 2024-01-01 --to 2024-01-31 --json",
      "invoca transactions list --as network --id 456 --limit 50 --cursor TXN-LAST-ID",
      "invoca transactions list --as affiliate --id 789 --type Signal",
    ],
  });
}
