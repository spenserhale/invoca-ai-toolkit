import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { InvocaClient, resolveConfig, InvocaError } from "@invoca-toolkit/sdk";

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

const transactionsGetInputSchema = z.object({
  as: roleSchema,
  id: z.string().min(1),
  transaction_id: z.string().min(1),
});

function newClient(): InvocaClient {
  return new InvocaClient(resolveConfig());
}

async function fetchOne(
  client: InvocaClient,
  role: "advertiser" | "network" | "affiliate",
  roleId: string,
  transactionId: string,
): Promise<Record<string, unknown>> {
  const fetcher = client.transactions[role].bind(client.transactions);
  const page = await fetcher(roleId, { transaction_id: transactionId });
  const rows = Array.isArray(page) ? page : page.transactions;
  const found = rows[0] as Record<string, unknown> | undefined;
  if (!found) {
    throw new InvocaError({
      code: "E_NOT_FOUND",
      message: `transaction not found`,
      got: transactionId,
    });
  }
  return found;
}

export function registerTransactionsTools(server: FastMCP): void {
  server.addTool({
    name: "transactions_list",
    description:
      "List transactions for an advertiser, network, or affiliate. Returns a bounded page of transaction records.",
    parameters: transactionsListInputSchema,
    execute: async (input) => {
      const client = newClient();
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
        { transactions, total: transactions.length, next_cursor },
        null,
        2,
      );
    },
  });

  server.addTool({
    name: "transactions_get",
    description:
      "Fetch a single transaction by its transaction_id. Returns the full record including recording_download_url (a 5-minute pre-signed S3 URL).",
    parameters: transactionsGetInputSchema,
    execute: async (input) => {
      const client = newClient();
      const tx = await fetchOne(client, input.as, input.id, input.transaction_id);
      return JSON.stringify(tx, null, 2);
    },
  });
}
