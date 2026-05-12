import { afterEach, describe, expect, it } from "bun:test";
import { z } from "zod";
import { request } from "../src/http.js";
import { isInvocaError } from "../src/errors.js";
import { mockFetch, type MockFetchHandle } from "./helpers/mockFetch.js";

let handle: MockFetchHandle | null = null;

afterEach(() => {
  handle?.restore();
  handle = null;
});

const Person = z.object({ name: z.string(), age: z.number() });

describe("request()", () => {
  it("returns validated JSON on 2xx", async () => {
    handle = mockFetch({ status: 200, body: { name: "Ada", age: 36 } });
    const result = await request({
      method: "GET",
      url: "https://api.example.com/p",
      schema: Person,
    });
    expect(result).toEqual({ name: "Ada", age: 36 });
    expect(handle.calls[0]?.method).toBe("GET");
  });

  it("attaches User-Agent and JSON headers", async () => {
    handle = mockFetch({ status: 200, body: { name: "A", age: 1 } });
    await request({
      method: "POST",
      url: "https://api.example.com/p",
      body: { name: "A", age: 1 },
      userAgent: "test-agent/1.0",
      schema: Person,
    });
    const call = handle.calls[0]!;
    expect(call.headers["user-agent"]).toBe("test-agent/1.0");
    expect(call.headers["content-type"]).toBe("application/json");
    expect(call.body).toBe(JSON.stringify({ name: "A", age: 1 }));
  });

  it("appends query parameters", async () => {
    handle = mockFetch({ status: 200, body: { name: "A", age: 1 } });
    await request({
      method: "GET",
      url: "https://api.example.com/p",
      query: { ring_pool_key: "secret", limit: 5, skip: undefined },
      schema: Person,
    });
    expect(handle.calls[0]?.url).toBe(
      "https://api.example.com/p?ring_pool_key=secret&limit=5",
    );
  });

  it("maps 401 to E_AUTH", async () => {
    handle = mockFetch({ status: 401, body: { error: "bad token" } });
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        schema: Person,
        retries: 0,
      });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_AUTH");
        expect(err.statusCode).toBe(401);
      }
    }
  });

  it("maps 404 to E_NOT_FOUND", async () => {
    handle = mockFetch({ status: 404, body: "" });
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        schema: Person,
        retries: 0,
      });
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) expect(err.code).toBe("E_NOT_FOUND");
      else throw err;
    }
  });

  it("maps 429 to E_RATE_LIMIT and stops after retries", async () => {
    handle = mockFetch([
      { status: 429 },
      { status: 429 },
      { status: 429 },
    ]);
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        schema: Person,
        retries: 2,
      });
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_RATE_LIMIT");
        expect(handle!.calls).toHaveLength(3);
      } else throw err;
    }
  }, 15_000);

  it("retries 5xx and succeeds on later attempt", async () => {
    handle = mockFetch([
      { status: 502 },
      { status: 200, body: { name: "A", age: 1 } },
    ]);
    const result = await request({
      method: "GET",
      url: "https://api.example.com/p",
      schema: Person,
      retries: 2,
    });
    expect(result).toEqual({ name: "A", age: 1 });
    expect(handle.calls).toHaveLength(2);
  }, 15_000);

  it("throws E_VALIDATION when response shape mismatches", async () => {
    handle = mockFetch({ status: 200, body: { name: "A", age: "not a number" } });
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        schema: Person,
      });
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) expect(err.code).toBe("E_VALIDATION");
      else throw err;
    }
  });

  it("throws E_TIMEOUT when request exceeds timeoutMs", async () => {
    handle = mockFetch({ status: 200, body: { name: "A", age: 1 }, delayMs: 50 });
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        schema: Person,
        timeoutMs: 5,
        retries: 0,
      });
      throw new Error("expected throw");
    } catch (err) {
      if (isInvocaError(err)) expect(err.code).toBe("E_TIMEOUT");
      else throw err;
    }
  });

  it("redacts secret query params from error messages", async () => {
    handle = mockFetch({ status: 401, body: "" });
    try {
      await request({
        method: "GET",
        url: "https://api.example.com/p",
        query: { oauth_token: "shhh" },
        schema: Person,
        retries: 0,
      });
    } catch (err) {
      if (isInvocaError(err)) {
        expect(err.message).toContain("REDACTED");
        expect(err.message).not.toContain("shhh");
      }
    }
  });
});
