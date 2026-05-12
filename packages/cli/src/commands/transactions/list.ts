import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { buildClient } from "../../lib/sdk.js";
import {
  formatFlags,
  profileFlag,
  deliverFlag,
  paginationFlags,
  DEFAULT_LIST_LIMIT,
} from "../../lib/flags.js";

const VALID_ROLES = ["advertiser", "network", "affiliate"] as const;
type Role = (typeof VALID_ROLES)[number];

interface Flags {
  readonly as: string;
  readonly id: string;
  readonly from?: string;
  readonly to?: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly include?: string;
  readonly exclude?: string;
  readonly type?: string;
  readonly "transaction-id"?: string;
  readonly "call-record-id"?: string;
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
      as: {
        kind: "parsed",
        parse: String,
        brief: "Role perspective: advertiser, network, or affiliate",
        optional: false,
      },
      id: {
        kind: "parsed",
        parse: String,
        brief: "Advertiser, network, or affiliate ID",
        optional: false,
      },
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
      ...paginationFlags,
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const role = flags.as as Role;
      if (!VALID_ROLES.includes(role)) {
        throw new InvocaError({
          code: "E_VALIDATION",
          message: `--as must be one of: ${VALID_ROLES.join(", ")} (got: "${flags.as}")`,
          got: flags.as,
          validValues: [...VALID_ROLES],
        });
      }

      const limit = flags.limit ?? DEFAULT_LIST_LIMIT;
      const client = buildClient(flags);

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
        page = await client.transactions.advertiser(flags.id, cleaned);
      } else if (role === "network") {
        page = await client.transactions.network(flags.id, cleaned);
      } else {
        page = await client.transactions.affiliate(flags.id, cleaned);
      }

      const transactions = Array.isArray(page) ? page : page.transactions;
      const apiCursor = Array.isArray(page) ? undefined : page.next_cursor;
      const lastId =
        transactions.length > 0
          ? transactions[transactions.length - 1]?.transaction_id
          : undefined;
      const truncated = transactions.length >= limit;
      const nextCursor = apiCursor ?? (truncated && lastId ? lastId : undefined);

      await emit(
        {
          transactions,
          total: transactions.length,
          truncated,
          next_cursor: nextCursor,
        },
        flags,
      );
    });
  },
});
