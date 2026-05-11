import { describe, expect, it } from "bun:test";
import { InvocaClient } from "../src/client.js";

describe("InvocaClient", () => {
  it("should require an API key", () => {
    expect(() => new InvocaClient({ apiKey: "" })).toThrow();
  });

  it("should accept a valid config", () => {
    const client = new InvocaClient({
      apiKey: "test-key",
      baseUrl: "https://api.example.com",
    });
    expect(client).toBeDefined();
  });
});
