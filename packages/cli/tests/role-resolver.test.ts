import { describe, expect, it } from "bun:test";
import { resolveConfig, isInvocaError } from "@invoca-toolkit/sdk";
import { resolveRoleAndId } from "../src/commands/transactions/_shared.js";

describe("resolveRoleAndId", () => {
  it("prefers explicit --as / --id over env", () => {
    const config = resolveConfig({
      env: {
        INVOCA_ROLE: "network",
        INVOCA_NETWORK_ID: "9999",
        INVOCA_ADVERTISER_ID: "should-be-ignored",
      },
    });
    const { role, id, roleSource, idSource } = resolveRoleAndId(
      { as: "advertiser", id: "217350" },
      config,
    );
    expect(role).toBe("advertiser");
    expect(id).toBe("217350");
    expect(roleSource).toBe("flag");
    expect(idSource).toBe("flag");
  });

  it("falls back to env-derived role + per-role ID when both flags are absent", () => {
    const config = resolveConfig({
      env: {
        INVOCA_ROLE: "advertiser",
        INVOCA_ADVERTISER_ID: "217350",
      },
    });
    const { role, id, roleSource, idSource } = resolveRoleAndId({}, config);
    expect(role).toBe("advertiser");
    expect(id).toBe("217350");
    expect(roleSource).toBe("env");
    expect(idSource).toBe("env");
  });

  it("uses the right per-role ID env var based on the resolved role", () => {
    const cfgAffiliate = resolveConfig({
      env: {
        INVOCA_ROLE: "affiliate",
        INVOCA_ADVERTISER_ID: "advertiser-id-not-applicable",
        INVOCA_AFFILIATE_ID: "aff-42",
      },
    });
    const r1 = resolveRoleAndId({}, cfgAffiliate);
    expect(r1.role).toBe("affiliate");
    expect(r1.id).toBe("aff-42");

    const cfgNetwork = resolveConfig({
      env: {
        INVOCA_ROLE: "network",
        INVOCA_NETWORK_ID: "net-99",
      },
    });
    const r2 = resolveRoleAndId({}, cfgNetwork);
    expect(r2.role).toBe("network");
    expect(r2.id).toBe("net-99");
  });

  it("E_CONFIG when neither --as nor INVOCA_ROLE is provided", () => {
    const config = resolveConfig({ env: {} });
    try {
      resolveRoleAndId({}, config);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_CONFIG");
        expect(err.message).toContain("role");
        expect(err.hint).toContain("INVOCA_ROLE");
      }
    }
  });

  it("E_CONFIG when role resolves but matching per-role ID env is missing", () => {
    const config = resolveConfig({
      env: { INVOCA_ROLE: "advertiser" },
    });
    try {
      resolveRoleAndId({}, config);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) {
        expect(err.code).toBe("E_CONFIG");
        expect(err.hint).toContain("INVOCA_ADVERTISER_ID");
      }
    }
  });

  it("E_VALIDATION for an explicit --as that isn't a valid role", () => {
    const config = resolveConfig({ env: {} });
    try {
      resolveRoleAndId({ as: "publisher", id: "1" }, config);
      throw new Error("expected throw");
    } catch (err) {
      expect(isInvocaError(err)).toBe(true);
      if (isInvocaError(err)) expect(err.code).toBe("E_VALIDATION");
    }
  });
});
