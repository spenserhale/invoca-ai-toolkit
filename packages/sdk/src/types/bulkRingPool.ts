import { z } from "zod";

export const BulkRingPoolAllocateRequestSchema = z
  .object({
    ring_pool_id: z.string().min(1),
    ring_pool_key: z.string().min(1),
    request_id: z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean()]));

export type BulkRingPoolAllocateRequest = z.infer<
  typeof BulkRingPoolAllocateRequestSchema
>;

export const BulkRingPoolAllocateRequestsSchema = z
  .array(BulkRingPoolAllocateRequestSchema)
  .min(1, "At least one allocation request is required");

export const BulkRingPoolAllocationSchema = z
  .object({
    request_id: z.string().optional(),
    promo_number_formatted: z.string().optional(),
    promo_number: z.string().optional(),
    tracking_url: z.string().optional(),
    overflow: z.boolean().optional(),
    error_class: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export type BulkRingPoolAllocation = z.infer<typeof BulkRingPoolAllocationSchema>;

export const BulkRingPoolResponseBodySchema = z.object({
  responses: z.array(BulkRingPoolAllocationSchema),
});

export const BulkRingPoolAllocationsSchema = z.array(BulkRingPoolAllocationSchema);
