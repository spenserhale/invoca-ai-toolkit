import { describe, expect, it } from "bun:test";
import {
  resolveConfig,
  hostFor,
  requireOauthToken,
  roleIdFor,
  envVarForRoleId,
} from "../src/config.js";
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

describe("role + role-id env resolution", () => {
  it("reads INVOCA_ROLE and per-role IDs from env", () => {
    const cfg = resolveConfig({
      env: {
        INVOCA_ROLE: "advertiser",
        INVOCA_ADVERTISER_ID: "217350",
        INVOCA_NETWORK_ID: "1234",
        INVOCA_AFFILIATE_ID: "5678",
      },
    });
    expect(cfg.role).toBe("advertiser");
    expect(cfg.advertiserId).toBe("217350");
    expect(cfg.networkId).toBe("1234");
    expect(cfg.affiliateId).toBe("5678");
  });

  it("rejects an INVOCA_ROLE that isn't one of the three valid roles", () => {
    try {
      resolveConfig({ env: { INVOCA_ROLE: "publisher" } });
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_CONFIG");
    }
  });

  it("explicit overrides win over env values", () => {
    const cfg = resolveConfig({
      role: "network",
      advertiserId: "explicit-advertiser",
      env: {
        INVOCA_ROLE: "advertiser",
        INVOCA_ADVERTISER_ID: "env-advertiser",
      },
    });
    expect(cfg.role).toBe("network");
    expect(cfg.advertiserId).toBe("explicit-advertiser");
  });

  it("roleIdFor picks the right field per role", () => {
    const cfg = resolveConfig({
      env: {
        INVOCA_ADVERTISER_ID: "A",
        INVOCA_NETWORK_ID: "N",
        INVOCA_AFFILIATE_ID: "F",
      },
    });
    expect(roleIdFor("advertiser", cfg)).toBe("A");
    expect(roleIdFor("network", cfg)).toBe("N");
    expect(roleIdFor("affiliate", cfg)).toBe("F");
  });

  it("envVarForRoleId returns the right env-var name per role", () => {
    expect(envVarForRoleId("advertiser")).toBe("INVOCA_ADVERTISER_ID");
    expect(envVarForRoleId("network")).toBe("INVOCA_NETWORK_ID");
    expect(envVarForRoleId("affiliate")).toBe("INVOCA_AFFILIATE_ID");
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
