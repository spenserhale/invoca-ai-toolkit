import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { buildClientFromConfig, resolveCliConfig } from "../../lib/sdk.js";
import {
  formatFlags,
  profileFlag,
  deliverFlag,
  paginationFlags,
  DEFAULT_LIST_LIMIT,
} from "../../lib/flags.js";
import { resolveRoleAndId, roleFlags } from "./_shared.js";

interface Flags {
  readonly as?: string;
  readonly id?: string;
  readonly from?: string;
  readonly to?: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly include?: string;
  readonly exclude?: string;
  readonly type?: string;
  readonly "transaction-id"?: string;
  readonly "call-record-id"?: string;
  readonly "require-recording": boolean;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
}

export const transactionsListCommand = buildCommand({
  docs: { brief: "List transactions for an advertiser, network, or affiliate" },
  parameters: {
    flags: {
      ...roleFlags,
      from: {
        kind: "parsed",
        parse: String,
        brief: "Start date (YYYY-MM-DD, inclusive)",
        optional: true,
      },
      to: {
        kind: "parsed",
        parse: String,
        brief: "End date (YYYY-MM-DD, inclusive)",
        optional: true,
      },
      include: {
        kind: "parsed",
        parse: String,
        brief: "Comma-separated list of columns to include",
        optional: true,
      },
      exclude: {
        kind: "parsed",
        parse: String,
        brief: "Comma-separated list of columns to exclude",
        optional: true,
      },
      type: {
        kind: "parsed",
        parse: String,
        brief: "Filter by transaction type: Call, PostCallEvent, Sale, or Signal",
        optional: true,
      },
      "transaction-id": {
        kind: "parsed",
        parse: String,
        brief: "Filter to a specific transaction ID",
        optional: true,
      },
      "call-record-id": {
        kind: "parsed",
        parse: String,
        brief: "Filter to transactions for a specific call record ID",
        optional: true,
      },
      "require-recording": {
        kind: "boolean",
        brief:
          "Drop transactions whose `recording` field is null/empty (client-side filter; pagination cursor still tracks the API response)",
        default: false,
      } as const,
      ...paginationFlags,
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const config = resolveCliConfig(flags);
      const { role, id } = resolveRoleAndId(flags, config);

      const limit = flags.limit ?? DEFAULT_LIST_LIMIT;
      const client = buildClientFromConfig(config);

      const apiParams: Record<string, unknown> = {
        limit,
        from: flags.from,
        to: flags.to,
        start_after_transaction_id: flags.cursor,
        transaction_type: flags.type,
        transaction_id: flags["transaction-id"],
        call_record_id: flags["call-record-id"],
        include_columns: flags.include ? flags.include.split(",") : undefined,
        exclude_columns: flags.exclude ? flags.exclude.split(",") : undefined,
      };

      const cleaned = Object.fromEntries(
        Object.entries(apiParams).filter(([, v]) => v !== undefined),
      );

      let page: Awaited<ReturnType<typeof client.transactions.advertiser>>;
      if (role === "advertiser") {
        page = await client.transactions.advertiser(id, cleaned);
      } else if (role === "network") {
        page = await client.transactions.network(id, cleaned);
      } else {
        page = await client.transactions.affiliate(id, cleaned);
      }

      const apiTransactions = Array.isArray(page) ? page : page.transactions;
      const apiCursor = Array.isArray(page) ? undefined : page.next_cursor;
      const lastId =
        apiTransactions.length > 0
          ? apiTransactions[apiTransactions.length - 1]?.transaction_id
          : undefined;
      const truncated = apiTransactions.length >= limit;
      const nextCursor = apiCursor ?? (truncated && lastId ? lastId : undefined);

      const transactions = flags["require-recording"]
        ? apiTransactions.filter((t) => {
            const r = (t as { recording?: unknown }).recording;
            return typeof r === "string" && r.length > 0;
          })
        : apiTransactions;

      await emit(
        {
          transactions,
          total: transactions.length,
          truncated,
          next_cursor: nextCursor,
          ...(flags["require-recording"] && transactions.length !== apiTransactions.length
            ? { filtered_out: apiTransactions.length - transactions.length }
            : {}),
        },
        flags,
      );
    });
  },
});
