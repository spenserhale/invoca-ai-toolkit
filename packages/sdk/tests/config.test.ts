import { describe, expect, it } from "bun:test";
import { resolveConfig, hostFor, requireOauthToken } from "../src/config.js";
import { isInvocaError } from "../src/errors.js";

describe("resolveConfig", () => {
  it("applies defaults with empty env", () => {
    const cfg = resolveConfig({ env: {} });
    expect(cfg.network).toBe("invoca");
    expect(cfg.timeoutMs).toBe(30_000);
    expect(cfg.userAgent).toBe("invoca-toolkit");
    expect(cfg.oauthToken).toBeUndefined();
  });

  it("reads INVOCA_OAUTH_TOKEN and INVOCA_NETWORK from env", () => {
    const cfg = resolveConfig({
      env: { INVOCA_OAUTH_TOKEN: "tok", INVOCA_NETWORK: "mynetwork" },
    });
    expect(cfg.oauthToken).toBe("tok");
    expect(cfg.network).toBe("mynetwork");
  });

  it("overrides env values with explicit input", () => {
    const cfg = resolveConfig({
      oauthToken: "explicit",
      env: { INVOCA_OAUTH_TOKEN: "envtok" },
    });
    expect(cfg.oauthToken).toBe("explicit");
  });

  it("reads base url overrides from env", () => {
    const cfg = resolveConfig({
      env: {
        INVOCA_BASE_URL_SIGNAL: "https://signal.example.com",
        INVOCA_BASE_URL_RINGPOOL: "https://rp.example.com",
      },
    });
    expect(cfg.baseUrlOverrides.signal).toBe("https://signal.example.com");
    expect(cfg.baseUrlOverrides.ringPool).toBe("https://rp.example.com");
  });

  it("rejects invalid network subdomain", () => {
    try {
      resolveConfig({ env: { INVOCA_NETWORK: "Bad Network!" } });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_CONFIG");
    }
  });
});

describe("hostFor", () => {
  it("uses <network>.invoca.net for ringPool and transactions", () => {
    const cfg = resolveConfig({ env: { INVOCA_NETWORK: "acme" } });
    expect(hostFor("ringPool", cfg)).toBe("https://acme.invoca.net");
    expect(hostFor("transactions", cfg)).toBe("https://acme.invoca.net");
  });

  it("uses pnapi.invoca.net for pnapi", () => {
    expect(hostFor("pnapi", resolveConfig({ env: {} }))).toBe(
      "https://pnapi.invoca.net",
    );
  });

  it("uses invoca.net for signal", () => {
    expect(hostFor("signal", resolveConfig({ env: {} }))).toBe(
      "https://invoca.net",
    );
  });

  it("overrides win over defaults", () => {
    const cfg = resolveConfig({
      env: { INVOCA_BASE_URL_SIGNAL: "https://sandbox.example.com" },
    });
    expect(hostFor("signal", cfg)).toBe("https://sandbox.example.com");
  });
});

describe("requireOauthToken", () => {
  it("returns token when present", () => {
    const cfg = resolveConfig({ env: { INVOCA_OAUTH_TOKEN: "tok" } });
    expect(requireOauthToken(cfg)).toBe("tok");
  });

  it("throws E_CONFIG when absent", () => {
    const cfg = resolveConfig({ env: {} });
    try {
      requireOauthToken(cfg);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_CONFIG");
    }
  });
});
