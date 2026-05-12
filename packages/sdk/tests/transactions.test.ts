import { afterEach, describe, expect, it } from "bun:test";
import { TransactionsFamily } from "../src/families/transactions.js";
import { isInvocaError } from "../src/errors.js";
import { resolveConfig } from "../src/config.js";
import { mockFetch, type MockFetchHandle } from "./helpers/mockFetch.js";
import { transactionsResponse } from "./helpers/fixtures.js";

let handle: MockFetchHandle | null = null;

afterEach(() => {
  handle?.restore();
  handle = null;
});

function makeFamily(opts: { oauthToken?: string; network?: string } = {}) {
  const config = resolveConfig({
    oauthToken: opts.oauthToken ?? "test-token",
    network: opts.network ?? "acme",
    env: {},
  });
  return new TransactionsFamily(config);
}

describe("TransactionsFamily.advertiser()", () => {
  it("hits the correct advertiser URL with query params", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    const result = await family.advertiser("123", {
      from: "2024-01-01",
      to: "2024-01-31",
      limit: 10,
    });
    const call = handle.calls[0]!;
    expect(call.method).toBe("GET");
    expect(call.url).toContain("https://acme.invoca.net/api/2020-10-01/advertisers/transactions/123.json");
    expect(call.url).toContain("from=2024-01-01");
    expect(call.url).toContain("to=2024-01-31");
    expect(call.url).toContain("limit=10");
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(2);
    }
  });

  it("sends raw Authorization header (Invoca uses no scheme prefix)", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily({ oauthToken: "my-secret-token" });
    await family.advertiser("123");
    const call = handle.calls[0]!;
    expect(call.headers["authorization"]).toBe("my-secret-token");
  });
});

describe("TransactionsFamily.network()", () => {
  it("hits the correct network URL", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.network("456");
    const call = handle.calls[0]!;
    expect(call.url).toContain("https://acme.invoca.net/api/2020-10-01/networks/transactions/456.json");
  });
});

describe("TransactionsFamily.affiliate()", () => {
  it("hits the correct affiliate URL", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.affiliate("789");
    const call = handle.calls[0]!;
    expect(call.url).toContain("https://acme.invoca.net/api/2020-10-01/affiliates/transactions/789.json");
  });
});

describe("TransactionsFamily query params", () => {
  it("serializes include_columns as comma-joined string", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.advertiser("123", { include_columns: ["a", "b", "c"] });
    const call = handle.calls[0]!;
    expect(call.url).toContain("include_columns=a%2Cb%2Cc");
  });

  it("serializes exclude_columns as comma-joined string", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.advertiser("123", { exclude_columns: ["x", "y"] });
    const call = handle.calls[0]!;
    expect(call.url).toContain("exclude_columns=x%2Cy");
  });

  it("forwards start_after_transaction_id as query param", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.advertiser("123", { start_after_transaction_id: "C624DA2C-CF3367C3" });
    const call = handle.calls[0]!;
    expect(call.url).toContain("start_after_transaction_id=C624DA2C-CF3367C3");
  });

  it("forwards transaction_type as query param", async () => {
    handle = mockFetch({ status: 200, body: transactionsResponse });
    const family = makeFamily();
    await family.advertiser("123", { transaction_type: "Signal" });
    const call = handle.calls[0]!;
    expect(call.url).toContain("transaction_type=Signal");
  });
});

describe("TransactionsFamily error handling", () => {
  it("throws E_CONFIG when oauthToken is missing", async () => {
    expect(() =>
      resolveConfig({ oauthToken: undefined, network: "acme", env: {} }),
    ).not.toThrow();
    const config = resolveConfig({ network: "acme", env: {} });
    const family = new TransactionsFamily(config);
    handle = mockFetch({ status: 200, body: transactionsResponse });
    try {
      await family.advertiser("123");
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_CONFIG");
      }
    }
  });

  it("throws E_AUTH on 401 response", async () => {
    handle = mockFetch({ status: 401, body: { error: "unauthorized" } });
    const family = makeFamily();
    try {
      await family.advertiser("123");
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.statusCode).toBe(401);
      }
    }
  });

  it("throws E_NOT_FOUND on 404 response", async () => {
    handle = mockFetch({ status: 404, body: "" });
    const family = makeFamily();
    try {
      await family.advertiser("999");
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_NOT_FOUND");
        expect(err.statusCode).toBe(404);
      }
    }
  });

  it("throws E_VALIDATION on schema mismatch", async () => {
    handle = mockFetch({ status: 200, body: { not_an_array: true } });
    const family = makeFamily();
    try {
      await family.advertiser("123");
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_VALIDATION");
      }
    }
  });
});
