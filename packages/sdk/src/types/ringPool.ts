import { z } from "zod";

export const RingPoolFormatSchema = z.enum(["json", "xml"]);
export type RingPoolFormat = z.infer<typeof RingPoolFormatSchema>;

export const RingPoolAllocateParamsSchema = z
  .object({
    ringPoolId: z.string().min(1),
    ringPoolKey: z.string().min(1),
    format: RingPoolFormatSchema.optional(),
    param1: z.string().optional(),
    param2: z.string().optional(),
    param3: z.string().optional(),
    param4: z.string().optional(),
    param5: z.string().optional(),
    param6: z.string().optional(),
    param7: z.string().optional(),
    param8: z.string().optional(),
    param9: z.string().optional(),
    param10: z.string().optional(),
    search_engine: z.string().optional(),
    search_keywords: z.string().optional(),
    search_keyword_id: z.string().optional(),
    landing_page: z.string().optional(),
    referrer: z.string().optional(),
    mobile_click_to_call: z.boolean().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]));

export type RingPoolAllocateParams = z.infer<typeof RingPoolAllocateParamsSchema>;

export const RingPoolAllocationSchema = z.object({
  promo_number_formatted: z.string(),
  promo_number: z.string(),
  tracking_url: z.string().optional(),
});

export type RingPoolAllocation = z.infer<typeof RingPoolAllocationSchema>;
