export const ringPoolAllocation = {
  promo_number_formatted: "(800) 555-0199",
  promo_number: "8005550199",
  tracking_url: "https://invoca.net/track/abc123",
};

export const bulkRingPoolAllocations = {
  responses: [
    {
      request_id: "req-1",
      promo_number_formatted: "(800) 555-0100",
      promo_number: "8005550100",
      tracking_url: "https://invoca.net/track/aaa",
    },
    {
      request_id: "req-2",
      error_class: "InvalidKey",
      message: "ring_pool_id not found",
    },
  ],
};

export const signalApplyResponse = {
  signals: [
    {
      transaction_id: "00000000-0000000A",
      corrects_transaction_id: null,
      name: "lead_quality",
      partner_unique_id: "1",
      occurred_at_time_t: "1440607313",
      occurred_at_time: "2015-08-26T16:41:53Z",
      revenue: "100.0",
      value: "true",
    },
  ],
  call: {
    transaction_id: "00000000-00000001",
    corrects_transaction_id: null,
    start_time_t: "1435993200",
    call_start_time: "2015-07-04T07:00:00Z",
  },
};

export const transactionsResponse = [
  { transaction_id: "txn_1", call_record_id: "call_1" },
  { transaction_id: "txn_2", call_record_id: "call_2" },
];
