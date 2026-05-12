import { afterEach, describe, expect, it } from "bun:test";
import { BulkRingPoolFamily } from "../src/families/bulkRingPool.js";
import { isInvocaError } from "../src/errors.js";
import { mockFetch, type MockFetchHandle } from "./helpers/mockFetch.js";

const defaultConfig = {
  timeoutMs: 30_000,
  userAgent: "invoca-toolkit-test",
  network: "invoca",
  baseUrlOverrides: {},
};

let handle: MockFetchHandle | null = null;

afterEach(() => {
  handle?.restore();
  handle = null;
});

const happyRequests = [
  { ring_pool_id: "42", ring_pool_key: "key-abc", m1: "autos", request_id: "req-1" },
  { ring_pool_id: "43", ring_pool_key: "key-def", m1: "antiques", request_id: "req-2" },
];

const happyResponse = {
  responses: [
    {
      request_id: "req-1",
      promo_number_formatted: "888-390-6665",
      promo_number: "8883906665",
      tracking_url: "https://invoca.net/track/aaa",
    },
    {
      request_id: "req-2",
      promo_number_formatted: "877-455-1120",
      promo_number: "8774551120",
      tracking_url: "https://invoca.net/track/bbb",
    },
  ],
};

describe("BulkRingPoolFamily.allocate()", () => {
  it("happy path: POSTs correct body and returns parsed array matching input length", async () => {
    handle = mockFetch({ status: 200, body: happyResponse });
    const family = new BulkRingPoolFamily(defaultConfig);
    const result = await family.allocate(happyRequests);

    expect(result).toHaveLength(happyRequests.length);
    expect(result[0]?.promo_number_formatted).toBe("888-390-6665");
    expect(result[1]?.promo_number_formatted).toBe("877-455-1120");

    const call = handle.calls[0]!;
    expect(call.method).toBe("POST");
    expect(call.url).toContain("/api/2013-07-01/bulk.json");

    const body = JSON.parse(call.body!) as { requests: { api_suffix: string }[] };
    expect(body.requests).toHaveLength(2);
    expect(body.requests[0]?.api_suffix).toContain("42/allocate_number.json");
    expect(body.requests[0]?.api_suffix).toContain("ring_pool_key=key-abc");
    expect(body.requests[0]?.api_suffix).toContain("m1=autos");
    expect(body.requests[1]?.api_suffix).toContain("43/allocate_number.json");
  });

  it("ring_pool_key does NOT appear in the URL (body only)", async () => {
    handle = mockFetch({ status: 200, body: happyResponse });
    const family = new BulkRingPoolFamily(defaultConfig);
    await family.allocate(happyRequests);

    const callUrl = handle.calls[0]!.url;
    expect(callUrl).not.toContain("ring_pool_key");
  });

  it("mixed result: one success and one error deserialize without throwing", async () => {
    const mixedResponse = {
      responses: [
        {
          request_id: "req-1",
          promo_number_formatted: "888-390-6665",
          promo_number: "8883906665",
          tracking_url: "https://invoca.net/track/aaa",
        },
        {
          request_id: "req-2",
          error_class: "InvalidKey",
          message: "API Key is not valid",
        },
      ],
    };
    handle = mockFetch({ status: 200, body: mixedResponse });
    const family = new BulkRingPoolFamily(defaultConfig);
    const result = await family.allocate(happyRequests);

    expect(result).toHaveLength(2);
    expect(result[0]?.promo_number_formatted).toBe("888-390-6665");
    expect(result[0]?.error_class).toBeUndefined();
    expect(result[1]?.error_class).toBe("InvalidKey");
    expect(result[1]?.message).toBe("API Key is not valid");
    expect(result[1]?.promo_number_formatted).toBeUndefined();
  });

  it("overflow flag is present on overflow responses", async () => {
    const overflowResponse = {
      responses: [
        {
          request_id: "req-1",
          promo_number_formatted: "866-971-5703",
          promo_number: "8669715703",
          tracking_url: "https://invoca.net/track/ccc",
          overflow: true,
        },
      ],
    };
    handle = mockFetch({ status: 200, body: overflowResponse });
    const family = new BulkRingPoolFamily(defaultConfig);
    const result = await family.allocate([happyRequests[0]!]);

    expect(result[0]?.overflow).toBe(true);
  });

  it("empty input array throws E_VALIDATION before any HTTP call", async () => {
    handle = mockFetch({ status: 200, body: { responses: [] } });
    const family = new BulkRingPoolFamily(defaultConfig);

    try {
      await family.allocate([]);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_VALIDATION");
      }
    }

    expect(handle.calls).toHaveLength(0);
  });

  it("401 maps to E_AUTH", async () => {
    handle = mockFetch({ status: 401, body: { error: "unauthorized" } });
    const family = new BulkRingPoolFamily(defaultConfig);

    try {
      await family.allocate([happyRequests[0]!]);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.statusCode).toBe(401);
      }
    }
  });

  it("429 maps to E_RATE_LIMIT after retries exhausted", async () => {
    handle = mockFetch([
      { status: 429 },
      { status: 429 },
      { status: 429 },
    ]);
    const family = new BulkRingPoolFamily({
      ...defaultConfig,
      baseUrlOverrides: {},
    });

    try {
      await family.allocate([happyRequests[0]!]);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_RATE_LIMIT");
      }
    }
  }, 30_000);

  it("schema mismatch on response throws E_VALIDATION", async () => {
    handle = mockFetch({ status: 200, body: { unexpected_key: [1, 2, 3] } });
    const family = new BulkRingPoolFamily(defaultConfig);

    try {
      await family.allocate([happyRequests[0]!]);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_VALIDATION");
      }
    }
  });

  it("request_id is echoed in responses when provided", async () => {
    const responseWithIds = {
      responses: [
        {
          request_id: "193C5F",
          promo_number_formatted: "888-390-6665",
          promo_number: "8883906665",
          tracking_url: "https://invoca.net/track/aaa",
        },
      ],
    };
    handle = mockFetch({ status: 200, body: responseWithIds });
    const family = new BulkRingPoolFamily(defaultConfig);
    const result = await family.allocate([
      { ring_pool_id: "42", ring_pool_key: "key-abc", request_id: "193C5F" },
    ]);

    expect(result[0]?.request_id).toBe("193C5F");
  });
});
