import { afterEach, describe, expect, it } from "bun:test";
import { RingPoolFamily } from "../src/families/ringPool.js";
import { isInvocaError } from "../src/errors.js";
import { resolveConfig } from "../src/config.js";
import { mockFetch, type MockFetchHandle } from "./helpers/mockFetch.js";
import { ringPoolAllocation } from "./helpers/fixtures.js";

let handle: MockFetchHandle | null = null;

afterEach(() => {
  handle?.restore();
  handle = null;
});

function makeFamily(network = "testnet") {
  const config = resolveConfig({ network });
  return new RingPoolFamily(config);
}

describe("RingPoolFamily.allocate()", () => {
  it("happy path: GET hits correct URL with ring_pool_key and extras in query", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    const result = await family.allocate({
      ringPoolId: "16",
      ringPoolKey: "secret-key",
      format: "json",
      param1: "homepage",
    });
    expect(result).toEqual(ringPoolAllocation);
    const call = handle.calls[0]!;
    expect(call.method).toBe("GET");
    expect(call.url).toContain("https://testnet.invoca.net/api/2015-12-09/ring_pools/16/allocate_number.json");
    expect(call.url).toContain("ring_pool_key=secret-key");
    expect(call.url).toContain("param1=homepage");
  });

  it("format=xml routes to .xml URL", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    await family.allocate({
      ringPoolId: "99",
      ringPoolKey: "key-xml",
      format: "xml",
    });
    expect(handle.calls[0]?.url).toContain("allocate_number.xml");
  });

  it("default format is json", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    await family.allocate({ ringPoolId: "1", ringPoolKey: "k" });
    expect(handle.calls[0]?.url).toContain("allocate_number.json");
  });

  it("passes extra caller params (search_engine, landing_page, referrer) in query", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    await family.allocate({
      ringPoolId: "16",
      ringPoolKey: "k",
      search_engine: "google",
      search_keywords: "buy shoes",
      landing_page: "https://example.com/shoes",
      referrer: "https://google.com",
    });
    const url = handle.calls[0]!.url;
    expect(url).toContain("search_engine=google");
    expect(url).toContain("search_keywords=buy+shoes");
    expect(url).toContain("landing_page=");
    expect(url).toContain("referrer=");
  });

  it("passes arbitrary extra params (affiliate id) in query", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    await family.allocate({
      ringPoolId: "16",
      ringPoolKey: "k",
      pid: "5567",
      sid: "adwords",
    });
    const url = handle.calls[0]!.url;
    expect(url).toContain("pid=5567");
    expect(url).toContain("sid=adwords");
  });

  it("response validates against RingPoolAllocationSchema and returns correct shape", async () => {
    handle = mockFetch({ status: 200, body: ringPoolAllocation });
    const family = makeFamily("testnet");
    const result = await family.allocate({ ringPoolId: "16", ringPoolKey: "k" });
    expect(result.promo_number_formatted).toBe(ringPoolAllocation.promo_number_formatted);
    expect(result.promo_number).toBe(ringPoolAllocation.promo_number);
    expect(result.tracking_url).toBe(ringPoolAllocation.tracking_url);
  });

  it("401 → InvocaError with code E_AUTH", async () => {
    handle = mockFetch({ status: 401, body: "InvalidKey: API Key is not valid" });
    const family = makeFamily("testnet");
    try {
      await family.allocate({ ringPoolId: "16", ringPoolKey: "bad-key" });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_AUTH");
    }
  });

  it("404 → InvocaError with code E_NOT_FOUND", async () => {
    handle = mockFetch({ status: 404, body: "" });
    const family = makeFamily("testnet");
    try {
      await family.allocate({ ringPoolId: "9999", ringPoolKey: "k" });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_NOT_FOUND");
    }
  });

  it("schema mismatch (missing promo_number) → E_VALIDATION", async () => {
    handle = mockFetch({ status: 200, body: { tracking_url: "https://invoca.net/c/1" } });
    const family = makeFamily("testnet");
    try {
      await family.allocate({ ringPoolId: "16", ringPoolKey: "k" });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_VALIDATION");
    }
  });

  it("ring_pool_key is redacted in 401 error messages", async () => {
    handle = mockFetch({ status: 401, body: "bad key", });
    const family = makeFamily("testnet");
    try {
      await family.allocate({ ringPoolId: "16", ringPoolKey: "super-secret-key" });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.message).toContain("REDACTED");
        expect(err.message).not.toContain("super-secret-key");
      }
    }
  });
});
