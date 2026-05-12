import { z } from "zod";

export const TransactionsFormatSchema = z.enum(["json", "xml", "csv"]);

export const TransactionsQueryParamsSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
    limit: z.number().int().positive().max(4000).optional(),
    transaction_id: z.string().optional(),
    call_record_id: z.string().optional(),
    start_after_transaction_id: z.string().optional(),
    include_columns: z.array(z.string()).optional(),
    exclude_columns: z.array(z.string()).optional(),
    transaction_type: z.string().optional(),
    format: TransactionsFormatSchema.optional(),
  })
  .passthrough();

export type TransactionsQueryParams = z.infer<typeof TransactionsQueryParamsSchema>;

export const TransactionCustomDataItemSchema = z
  .object({
    name: z.string().optional(),
    data_type: z.string().optional(),
    source: z.string().optional(),
    value: z.union([z.string(), z.boolean(), z.null()]).optional(),
  })
  .passthrough();

export type TransactionCustomDataItem = z.infer<typeof TransactionCustomDataItemSchema>;

export const TransactionSchema = z
  .object({
    transaction_id: z.string().optional(),
    complete_call_id: z.string().optional(),
    call_record_id: z.string().optional(),
    transaction_type: z.string().optional(),
    start_time_local: z.string().optional(),
    start_time_utc: z.union([z.string(), z.number()]).optional(),
    start_time_xml: z.string().optional(),
    start_time_network_timezone: z.string().optional(),
    start_time_network_timezone_xml: z.string().optional(),
    duration: z.union([z.string(), z.number()]).optional(),
    connect_duration: z.union([z.string(), z.number()]).optional(),
    ivr_duration: z.union([z.string(), z.number()]).optional(),
    calling_phone_number: z.string().optional(),
    destination_phone_number: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    mobile: z.string().optional(),
    repeat_calling_phone_number: z.union([z.string(), z.boolean()]).optional(),
    recording: z.string().optional(),
    notes: z.string().optional(),
    media_type: z.string().optional(),
    call_source_description: z.string().optional(),
    call_result_description_detail: z.string().optional(),
    call_result_description_detail_managed_advertiser: z.string().optional(),
    transfer_from_type: z.string().optional(),
    verified_zip: z.string().optional(),
    qualified_regions: z.string().optional(),
    opt_in_SMS: z.union([z.string(), z.boolean()]).optional(),
    virtual_line_id: z.string().optional(),
    syndicated_ident: z.string().optional(),
    hangup_cause: z.string().optional(),
    advertiser_campaign_id: z.string().optional(),
    advertiser_campaign_id_from_network: z.string().optional(),
    advertiser_campaign_name: z.string().optional(),
    advertiser_campaign_country: z.string().optional(),
    advertiser_payin_localized: z.string().optional(),
    advertiser_promo_line_description: z.string().optional(),
    advertiser_id: z.string().optional(),
    advertiser_id_from_network: z.string().optional(),
    advertiser_name: z.string().optional(),
    advertiser_call_fee_localized: z.string().optional(),
    affiliate_id: z.string().optional(),
    affiliate_id_from_network: z.string().optional(),
    affiliate_name: z.string().optional(),
    affiliate_payout_localized: z.string().optional(),
    affiliate_call_volume_ranking: z.union([z.string(), z.number()]).optional(),
    affiliate_commissions_ranking: z.union([z.string(), z.number()]).optional(),
    affiliate_conversion_rate_ranking: z.union([z.string(), z.number()]).optional(),
    affiliate_campaign_id_from_network: z.string().optional(),
    matching_advertiser_payin_policies: z.string().optional(),
    matching_affiliate_payout_policies: z.string().optional(),
    payin_conditions: z.string().optional(),
    payout_conditions: z.string().optional(),
    margin_localized: z.string().optional(),
    call_fee_localized: z.string().optional(),
    promo_line_description: z.string().optional(),
    real_time_response: z.string().optional(),
    corrected_at: z.string().optional(),
    corrects_transaction_id: z.string().optional(),
    original_order_id: z.string().optional(),
    keypress_1: z.string().optional(),
    keypress_2: z.string().optional(),
    keypress_3: z.string().optional(),
    keypress_4: z.string().optional(),
    keypresses: z.string().optional(),
    dynamic_number_pool_id: z.string().optional(),
    dynamic_number_pool_pool_type: z.string().optional(),
    dynamic_number_pool_referrer_search_engine: z.string().optional(),
    dynamic_number_pool_referrer_search_keywords: z.string().optional(),
    dynamic_number_pool_referrer_search_type: z.string().optional(),
    dynamic_number_pool_referrer_ad: z.string().optional(),
    dynamic_number_pool_referrer_ad_group: z.string().optional(),
    dynamic_number_pool_referrer_ad_group_id: z.string().optional(),
    dynamic_number_pool_referrer_ad_id: z.string().optional(),
    dynamic_number_pool_referrer_referrer_campaign: z.string().optional(),
    dynamic_number_pool_referrer_referrer_campaign_id: z.string().optional(),
    dynamic_number_pool_referrer_search_keywords_id: z.string().optional(),
    dynamic_number_pool_referrer_keyword_match_type: z.string().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    cell_phone_number: z.string().optional(),
    country: z.string().optional(),
    email_address: z.string().optional(),
    home_phone_number: z.string().optional(),
    name: z.string().optional(),
    order_city: z.string().optional(),
    quantity_list: z.string().optional(),
    reason_code: z.string().optional(),
    sale_amount: z.string().optional(),
    sku_list: z.string().optional(),
    state_or_province: z.string().optional(),
    zip_code: z.string().optional(),
    signal_name: z.string().optional(),
    signal_description: z.string().optional(),
    signal_partner_unique_id: z.string().optional(),
    signal_occurred_at: z.union([z.string(), z.number()]).optional(),
    signal_source: z.string().optional(),
    signal_value: z.union([z.string(), z.boolean(), z.null()]).optional(),
    signal_custom_parameter_1: z.string().optional(),
    signal_custom_parameter_2: z.string().optional(),
    signal_custom_parameter_3: z.string().optional(),
    revenue: z.union([z.string(), z.number()]).optional(),
    custom_data: z.array(TransactionCustomDataItemSchema).optional(),
    external_data: z.string().optional(),
  })
  .passthrough();

export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionsPageSchema = z.union([
  z.array(TransactionSchema),
  z
    .object({
      transactions: z.array(TransactionSchema),
      next_cursor: z.string().optional(),
    })
    .passthrough(),
]);

export type TransactionsPage = z.infer<typeof TransactionsPageSchema>;
