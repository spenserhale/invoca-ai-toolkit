import { afterEach, describe, expect, it } from "bun:test";
import { InvocaClient } from "../src/client.js";
import { resolveConfig } from "../src/config.js";
import { isInvocaError } from "../src/errors.js";
import { SignalApplyParamsSchema } from "../src/types/signal.js";
import { mockFetch, type MockFetchHandle } from "./helpers/mockFetch.js";
import { signalApplyResponse } from "./helpers/fixtures.js";

let handle: MockFetchHandle | null = null;

afterEach(() => {
  handle?.restore();
  handle = null;
});

const validParams = {
  search: { transaction_id: "00000000-00000001" },
  signals: [{ name: "lead_quality", value: "good", partner_unique_id: "1" }],
};

function makeClient(token = "test-token-abc"): InvocaClient {
  return new InvocaClient({ oauthToken: token });
}

describe("SignalFamily.apply() (POST)", () => {
  it("sends POST with correct URL, Authorization header, and body", async () => {
    handle = mockFetch({ status: 200, body: signalApplyResponse });
    const client = makeClient("my-secret-token");
    const result = await client.signal.apply(validParams);

    const call = handle.calls[0]!;
    expect(call.method).toBe("POST");
    expect(call.url).toBe("https://invoca.net/api/2018-02-01/transactions.json");
    expect(call.headers["authorization"]).toBe("my-secret-token");
    expect(JSON.parse(call.body!)).toMatchObject({
      search: { transaction_id: "00000000-00000001" },
      signals: [{ name: "lead_quality" }],
    });
    expect(result.signals).toHaveLength(1);
    expect(result.call.transaction_id).toBe("00000000-00000001");
  });

  it("parses a response with multiple signals", async () => {
    const multiResponse = {
      signals: [
        {
          transaction_id: "00000000-0000000A",
          corrects_transaction_id: null,
          name: "sale",
          partner_unique_id: "1",
          occurred_at_time_t: "1440607313",
          occurred_at_time: "2015-08-26T16:41:53Z",
          revenue: "100.0",
          value: "true",
        },
        {
          transaction_id: "00000000-0000000B",
          corrects_transaction_id: null,
          name: "quote",
          partner_unique_id: "",
          occurred_at_time_t: "1440607313",
          occurred_at_time: "2015-08-26T16:41:53Z",
          revenue: "",
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
    handle = mockFetch({ status: 200, body: multiResponse });
    const result = await makeClient().signal.apply({
      search: { transaction_id: "00000000-00000001" },
      signals: [{ name: "sale", partner_unique_id: "1" }, { name: "quote" }],
    });
    expect(result.signals).toHaveLength(2);
    expect(result.signals[0]!.name).toBe("sale");
    expect(result.signals[1]!.name).toBe("quote");
  });

  it("sends custom_data when provided", async () => {
    handle = mockFetch({ status: 200, body: { signals: [], call: { transaction_id: "t1", corrects_transaction_id: null } } });
    await makeClient().signal.apply({
      search: { transaction_id: "t1" },
      signals: [{ name: "sale" }],
      custom_data: [{ name: "channel", value: "Paid Search" }],
    });
    const body = JSON.parse(handle.calls[0]!.body!);
    expect(body.custom_data).toEqual([{ name: "channel", value: "Paid Search" }]);
  });

  it("respects call_in_progress flag", async () => {
    handle = mockFetch({ status: 201, body: { signals: [], call: { transaction_id: "t1", corrects_transaction_id: null } } });
    await makeClient().signal.apply({
      search: { transaction_id: "t1" },
      signals: [{ name: "sale" }],
      call_in_progress: true,
    });
    const body = JSON.parse(handle.calls[0]!.body!);
    expect(body.call_in_progress).toBe(true);
  });
});

describe("SignalFamily.update() (PUT)", () => {
  it("sends PUT with the same URL and Authorization header", async () => {
    handle = mockFetch({ status: 200, body: signalApplyResponse });
    await makeClient("update-token").signal.update(validParams);

    const call = handle.calls[0]!;
    expect(call.method).toBe("PUT");
    expect(call.url).toBe("https://invoca.net/api/2018-02-01/transactions.json");
    expect(call.headers["authorization"]).toBe("update-token");
  });

  it("corrects_transaction_id reflects correction in PUT response", async () => {
    const correctionResponse = {
      signals: [
        {
          transaction_id: "00000000-0000000C",
          corrects_transaction_id: "00000000-0000000A",
          name: "Quote",
          partner_unique_id: "1",
          occurred_at_time_t: "1440607999",
          occurred_at_time: "2015-08-26T16:53:19Z",
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
    handle = mockFetch({ status: 200, body: correctionResponse });
    const result = await makeClient().signal.update(validParams);
    expect(result.signals[0]!.corrects_transaction_id).toBe("00000000-0000000A");
  });
});

describe("SignalFamily config validation", () => {
  it("throws E_CONFIG when oauthToken is missing", async () => {
    const config = resolveConfig({ env: {} });
    const client = new InvocaClient(config);
    try {
      await client.signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_CONFIG");
      }
    }
  });
});

describe("SignalApplyParamsSchema validation", () => {
  it("throws E_VALIDATION when search has neither transaction_id nor call_record_id nor call_start_time", () => {
    const result = SignalApplyParamsSchema.safeParse({
      search: {},
      signals: [{ name: "sale" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts call_record_id in search", () => {
    const result = SignalApplyParamsSchema.safeParse({
      search: { call_record_id: "call-abc" },
      signals: [{ name: "sale" }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts call_start_time in search", () => {
    const result = SignalApplyParamsSchema.safeParse({
      search: { call_start_time: "1440607313" },
      signals: [{ name: "sale" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects params with no signals and no custom_data", () => {
    const result = SignalApplyParamsSchema.safeParse({
      search: { transaction_id: "txn-1" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts params with only custom_data (no signals)", () => {
    const result = SignalApplyParamsSchema.safeParse({
      search: { transaction_id: "txn-1" },
      custom_data: [{ name: "channel", value: "Paid Search" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("SignalFamily HTTP error mapping", () => {
  it("maps 401 to E_AUTH", async () => {
    handle = mockFetch({ status: 401, body: { errors: { class: "Unauthorized", invalid_data: "bad token" } } });
    try {
      await makeClient().signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.statusCode).toBe(401);
      }
    }
  });

  it("maps 403 to E_AUTH", async () => {
    handle = mockFetch({ status: 403, body: { errors: { class: "UnauthorizedOperation", invalid_data: "no access" } } });
    try {
      await makeClient().signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.statusCode).toBe(403);
      } else throw err;
    }
  });

  it("maps 404 to E_NOT_FOUND", async () => {
    handle = mockFetch({ status: 404, body: { errors: { class: "RecordNotFound", invalid_data: "not found" } } });
    try {
      await makeClient().signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_NOT_FOUND");
      } else throw err;
    }
  });

  it("maps unexpected response shape to E_VALIDATION", async () => {
    handle = mockFetch({ status: 200, body: { unexpected: "shape" } });
    try {
      await makeClient().signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_VALIDATION");
      } else throw err;
    }
  });
});

describe("Token redaction", () => {
  it("oauth_token does not appear in E_AUTH error message when 401 is returned", async () => {
    handle = mockFetch({ status: 401, body: "" });
    const sensitiveToken = "super-secret-oauth-token-xyz";
    try {
      await makeClient(sensitiveToken).signal.apply(validParams);
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.message).not.toContain(sensitiveToken);
      } else throw err;
    }
  });
});
