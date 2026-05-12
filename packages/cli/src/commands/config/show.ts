import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { emit } from "../../lib/render.js";
import { resolveCliConfig } from "../../lib/sdk.js";
import { formatFlags, profileFlag, deliverFlag } from "../../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly profile?: string;
}

interface FieldView {
  readonly value: string | undefined;
  readonly source: "flag" | "env" | "profile" | "default" | "unset";
  readonly env_var?: string;
}

function fromEnv(envVar: string, value: string | undefined): FieldView {
  if (value === undefined || value === "") {
    return { value: undefined, source: "unset", env_var: envVar };
  }
  return { value, source: "env", env_var: envVar };
}

export const configShowCommand = buildCommand({
  docs: {
    brief:
      "Show resolved configuration with source labels (token is never printed)",
  },
  parameters: {
    flags: {
      ...formatFlags,
      ...deliverFlag,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const env = process.env;
      const config = resolveCliConfig(flags);

      const role: FieldView = fromEnv("INVOCA_ROLE", env.INVOCA_ROLE);
      const network: FieldView =
        env.INVOCA_NETWORK !== undefined && env.INVOCA_NETWORK !== ""
          ? { value: env.INVOCA_NETWORK, source: "env", env_var: "INVOCA_NETWORK" }
          : {
              value: config.network,
              source: "default",
              env_var: "INVOCA_NETWORK",
            };

      const advertiser_id = fromEnv(
        "INVOCA_ADVERTISER_ID",
        env.INVOCA_ADVERTISER_ID,
      );
      const network_id = fromEnv("INVOCA_NETWORK_ID", env.INVOCA_NETWORK_ID);
      const affiliate_id = fromEnv("INVOCA_AFFILIATE_ID", env.INVOCA_AFFILIATE_ID);

      const oauth_token: FieldView = config.oauthToken
        ? { value: "<set>", source: "env", env_var: "INVOCA_OAUTH_TOKEN" }
        : { value: undefined, source: "unset", env_var: "INVOCA_OAUTH_TOKEN" };

      const timeout_ms: FieldView =
        env.INVOCA_TIMEOUT_MS !== undefined && env.INVOCA_TIMEOUT_MS !== ""
          ? {
              value: String(config.timeoutMs),
              source: "env",
              env_var: "INVOCA_TIMEOUT_MS",
            }
          : {
              value: String(config.timeoutMs),
              source: "default",
              env_var: "INVOCA_TIMEOUT_MS",
            };

      const view = {
        role,
        network,
        advertiser_id,
        network_id,
        affiliate_id,
        oauth_token,
        timeout_ms,
        profile: flags.profile ?? null,
      };

      await emit(view, flags);
    });
  },
});
