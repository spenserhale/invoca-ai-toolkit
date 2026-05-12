import { z } from "zod";

export const SignalInputSchema = z.object({
  name: z.string().min(1),
  partner_unique_id: z.string().optional(),
  occurred_at_time: z.string().optional(),
  revenue: z.string().optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export type SignalInput = z.infer<typeof SignalInputSchema>;

export const CustomDataItemSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
});

export type CustomDataItem = z.infer<typeof CustomDataItemSchema>;

export const SignalSearchSchema = z
  .object({
    transaction_id: z.string().optional(),
    call_record_id: z.string().optional(),
    call_start_time: z.string().optional(),
    calling_phone_number: z.string().optional(),
    duration_in_seconds: z.union([z.string(), z.number()]).optional(),
    advertiser_id_from_network: z.string().optional(),
    advertiser_campaign_id_from_network: z.string().optional(),
    network_id: z.string().optional(),
  })
  .refine(
    (v) => v.transaction_id || v.call_record_id || v.call_start_time,
    "one of transaction_id, call_record_id, or call_start_time is required in search",
  );

export type SignalSearch = z.infer<typeof SignalSearchSchema>;

export const SignalApplyParamsSchema = z
  .object({
    search: SignalSearchSchema,
    signals: z.array(SignalInputSchema).optional(),
    custom_data: z.array(CustomDataItemSchema).optional(),
    partner_unique_id: z.string().optional(),
    occurred_at_time: z.string().optional(),
    call_in_progress: z.boolean().optional(),
  })
  .refine(
    (v) => (v.signals && v.signals.length > 0) || (v.custom_data && v.custom_data.length > 0),
    "at least one signal or custom_data entry is required",
  );

export type SignalApplyParams = z.infer<typeof SignalApplyParamsSchema>;

export const SignalResultSchema = z.object({
  transaction_id: z.string(),
  corrects_transaction_id: z.string().nullable(),
  name: z.string(),
  partner_unique_id: z.string().optional(),
  occurred_at_time_t: z.string().optional(),
  occurred_at_time: z.string().optional(),
  revenue: z.string().optional(),
  value: z.string().optional(),
});

export type SignalResult = z.infer<typeof SignalResultSchema>;

export const SignalCallSchema = z.object({
  transaction_id: z.string(),
  corrects_transaction_id: z.string().nullable(),
  start_time_t: z.string().optional(),
  call_start_time: z.string().optional(),
});

export type SignalCall = z.infer<typeof SignalCallSchema>;

export const SignalApplyResponseSchema = z.object({
  signals: z.array(SignalResultSchema),
  call: SignalCallSchema,
});

export type SignalApplyResponse = z.infer<typeof SignalApplyResponseSchema>;

export const SignalSchema = SignalInputSchema;
export type Signal = SignalInput;
