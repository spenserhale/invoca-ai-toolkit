import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { InvocaClient, resolveConfig, type BulkRingPoolAllocateRequest } from "@invoca-toolkit/sdk";

export function registerBulkRingPoolTools(server: FastMCP): void {
  server.addTool({
    name: "bulk_ringpool_allocate",
    description:
      "Batch-allocate promo numbers across one or more RingPools via the Invoca Bulk RingPool API. Returns a parallel array of allocation results; per-item errors are inline (error_class + message) and do not abort the batch.",
    parameters: z.object({
      requests: z.array(
        z
          .object({
            ring_pool_id: z.string().min(1),
            ring_pool_key: z.string().min(1),
            request_id: z.string().optional(),
          })
          .catchall(z.union([z.string(), z.number(), z.boolean()])),
      ).min(1),
    }),
    execute: async ({ requests }) => {
      const config = resolveConfig();
      const client = new InvocaClient(config);
      const results = await client.bulkRingPool.allocate(
        requests as BulkRingPoolAllocateRequest[],
      );
      return JSON.stringify(results, null, 2);
    },
  });
}
