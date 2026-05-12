import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { InvocaClient, resolveConfig } from "@invoca-toolkit/sdk";

const roleSchema = z.enum(["advertiser", "network", "affiliate"]);

const transactionsListInputSchema = z.object({
  as: roleSchema,
  id: z.string().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().positive().max(4000).optional(),
  start_after_transaction_id: z.string().optional(),
  include_columns: z.array(z.string()).optional(),
  exclude_columns: z.array(z.string()).optional(),
  transaction_type: z.string().optional(),
  transaction_id: z.string().optional(),
  call_record_id: z.string().optional(),
});

export function registerTransactionsTools(server: FastMCP): void {
  server.addTool({
    name: "transactions_list",
    description:
      "List transactions for an advertiser, network, or affiliate. Returns a bounded page of transaction records.",
    parameters: transactionsListInputSchema,
    execute: async (input) => {
      const config = resolveConfig();
      const client = new InvocaClient(config);

      const { as: role, id, ...queryParams } = input;

      const cleaned = Object.fromEntries(
        Object.entries(queryParams).filter(([, v]) => v !== undefined),
      ) as Parameters<typeof client.transactions.advertiser>[1];

      let page: Awaited<ReturnType<typeof client.transactions.advertiser>>;
      if (role === "advertiser") {
        page = await client.transactions.advertiser(id, cleaned);
      } else if (role === "network") {
        page = await client.transactions.network(id, cleaned);
      } else {
        page = await client.transactions.affiliate(id, cleaned);
      }

      const transactions = Array.isArray(page) ? page : page.transactions;
      const next_cursor = Array.isArray(page) ? undefined : page.next_cursor;

      return JSON.stringify(
        {
          transactions,
          total: transactions.length,
          next_cursor,
        },
        null,
        2,
      );
    },
  });
}
