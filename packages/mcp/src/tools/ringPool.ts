import { z } from "zod";
import type { FastMCP } from "fastmcp";
import { InvocaClient, resolveConfig } from "@invoca-toolkit/sdk";

const RingPoolAllocateToolParams = z.object({
  id: z.string().min(1).describe("RingPool ID"),
  key: z.string().min(1).describe("RingPool authentication key"),
  format: z.enum(["json", "xml"]).optional().default("json").describe("Response format"),
  param1: z.string().optional().describe("First custom parameter (Custom RingPools)"),
  param2: z.string().optional().describe("Second custom parameter (Custom RingPools)"),
  param3: z.string().optional().describe("Third custom parameter (Custom RingPools)"),
  param4: z.string().optional().describe("Fourth custom parameter (Custom RingPools)"),
  param5: z.string().optional().describe("Fifth custom parameter (Custom RingPools)"),
  param6: z.string().optional().describe("Sixth custom parameter (Custom RingPools)"),
  param7: z.string().optional().describe("Seventh custom parameter (Custom RingPools)"),
  param8: z.string().optional().describe("Eighth custom parameter (Custom RingPools)"),
  param9: z.string().optional().describe("Ninth custom parameter (Custom RingPools)"),
  param10: z.string().optional().describe("Tenth custom parameter (Custom RingPools)"),
  search_engine: z.string().optional().describe("Search engine name (Search RingPool types)"),
  search_keywords: z.string().optional().describe("Search query (Search RingPool types)"),
  search_keyword_id: z.string().optional().describe("Keyword ID (Keyword ID Search RingPool only)"),
  landing_page: z.string().optional().describe("Landing page URL for reporting"),
  referrer: z.string().optional().describe("Referrer URL (Referral Domain RingPool types)"),
  mobile_click_to_call: z.boolean().optional().describe("Return mobile-enabled links for smartphone dialer"),
  extra: z
    .record(z.string())
    .optional()
    .describe("Additional arbitrary query parameters (e.g. affiliate id fields)"),
});

type RingPoolAllocateToolInput = z.infer<typeof RingPoolAllocateToolParams>;

export function registerRingPoolTools(server: FastMCP): void {
  server.addTool({
    name: "ringpool_allocate",
    description:
      "Allocate a dynamic trackable promo phone number from an Invoca RingPool. Returns promo_number_formatted, promo_number, and tracking_url.",
    parameters: RingPoolAllocateToolParams,
    execute: async (args: RingPoolAllocateToolInput) => {
      const config = resolveConfig();
      const client = new InvocaClient(config);

      const { id, key, format = "json", extra, ...knownParams } = args;

      const result = await client.ringPool.allocate({
        ringPoolId: id,
        ringPoolKey: key,
        format,
        ...knownParams,
        ...(extra ?? {}),
      });

      return JSON.stringify(result, null, 2);
    },
  });
}
