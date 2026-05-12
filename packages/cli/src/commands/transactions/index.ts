import { buildRouteMap } from "@stricli/core";
import { transactionsListCommand } from "./list.js";
import { transactionsGetCommand } from "./get.js";
import { transactionsDownloadCommand } from "./download.js";
import { familySpecs } from "../../commandSpecs.js";

export const transactionsRoutes = buildRouteMap({
  routes: {
    list: transactionsListCommand,
    get: transactionsGetCommand,
    download: transactionsDownloadCommand,
  },
  docs: { brief: "Read transaction history for advertiser, network, or affiliate" },
});

export function registerTransactionsSpecs(): void {
  familySpecs.push(
    {
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
        { name: "--require-recording", brief: "Drop transactions without a recording (client-side filter; cursor still tracks API page)" },
        { name: "--toon", brief: "Output as TOON (default)" },
        { name: "--json", brief: "Output as JSON" },
        { name: "--csv", brief: "Output as CSV (flat rows only)" },
        { name: "--deliver", brief: "Route output: stdout (default), file:<path>, webhook:<url>", takesValue: true },
        { name: "--profile", brief: "Named profile to load", takesValue: true },
      ],
      examples: [
        "invoca transactions list --as advertiser --id 123 --from 2026-05-01 --to 2026-05-12 --type Call --json",
        "invoca transactions list --as network --id 456 --limit 50 --cursor TXN-LAST-ID",
        "invoca transactions list --as advertiser --id 123 --include transaction_id,recording_download_url --csv",
      ],
    },
    {
      path: ["transactions", "get"],
      brief: "Fetch a single transaction by its transaction_id",
      positional: [{ name: "transaction_id", brief: "Invoca transaction ID" }],
      flags: [
        { name: "--as", brief: "Role: advertiser, network, or affiliate", takesValue: true, required: true, values: ["advertiser", "network", "affiliate"] },
        { name: "--id", brief: "Advertiser, network, or affiliate ID", takesValue: true, required: true },
        { name: "--toon", brief: "Output as TOON (default)" },
        { name: "--json", brief: "Output as JSON" },
        { name: "--csv", brief: "Output as CSV (flat rows only)" },
        { name: "--deliver", brief: "Route output: stdout (default), file:<path>, webhook:<url>", takesValue: true },
        { name: "--profile", brief: "Named profile to load", takesValue: true },
      ],
      examples: [
        "invoca transactions get AC0E23E7-59B55738 --as advertiser --id 217350 --json",
      ],
    },
    {
      path: ["transactions", "download"],
      brief: "Stream a call recording to disk (refreshes the signed S3 URL just-in-time)",
      positional: [{ name: "transaction_id", brief: "Invoca transaction ID" }],
      flags: [
        { name: "--as", brief: "Role: advertiser, network, or affiliate", takesValue: true, required: true, values: ["advertiser", "network", "affiliate"] },
        { name: "--id", brief: "Advertiser, network, or affiliate ID", takesValue: true, required: true },
        { name: "--to", brief: "Destination file path (.mp3)", takesValue: true, required: true },
        { name: "--force", brief: "Overwrite if --to already exists" },
        { name: "--dry-run", brief: "Print what would be downloaded without writing" },
        { name: "--profile", brief: "Named profile to load", takesValue: true },
      ],
      examples: [
        "invoca transactions download AC0E23E7-59B55738 --as advertiser --id 217350 --to ./call.mp3",
        "invoca transactions download AC0E23E7-59B55738 --as advertiser --id 217350 --to ./call.mp3 --force",
      ],
    },
  );
}
