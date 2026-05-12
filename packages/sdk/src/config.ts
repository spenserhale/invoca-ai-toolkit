import { z } from "zod";
import { InvocaError } from "./errors.js";

export const BaseUrlOverridesSchema = z
  .object({
    pnapi: z.string().url().optional(),
    signal: z.string().url().optional(),
    transactions: z.string().url().optional(),
    ringPool: z.string().url().optional(),
  })
  .default({});

export const RoleSchema = z.enum(["advertiser", "network", "affiliate"]);
export type Role = z.infer<typeof RoleSchema>;

export const InvocaConfigSchema = z.object({
  oauthToken: z.string().min(1).optional(),
  network: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "network subdomain must be lowercase alphanumeric or hyphens")
    .default("invoca"),
  baseUrlOverrides: BaseUrlOverridesSchema,
  timeoutMs: z.number().int().positive().default(30_000),
  userAgent: z.string().min(1).default("invoca-toolkit"),
  role: RoleSchema.optional(),
  advertiserId: z.string().min(1).optional(),
  networkId: z.string().min(1).optional(),
  affiliateId: z.string().min(1).optional(),
});

export type InvocaConfig = z.infer<typeof InvocaConfigSchema>;
export type BaseUrlOverrides = z.infer<typeof BaseUrlOverridesSchema>;

export interface ResolveConfigInput {
  oauthToken?: string;
  network?: string;
  baseUrlOverrides?: BaseUrlOverrides;
  timeoutMs?: number;
  userAgent?: string;
  role?: Role;
  advertiserId?: string;
  networkId?: string;
  affiliateId?: string;
  env?: Record<string, string | undefined>;
}

export function resolveConfig(overrides: ResolveConfigInput = {}): InvocaConfig {
  const env = overrides.env ?? process.env;

  const overridesFromEnv: BaseUrlOverrides = {
    pnapi: env.INVOCA_BASE_URL_PNAPI,
    signal: env.INVOCA_BASE_URL_SIGNAL,
    transactions: env.INVOCA_BASE_URL_TRANSACTIONS,
    ringPool: env.INVOCA_BASE_URL_RINGPOOL,
  };

  const merged = {
    oauthToken: overrides.oauthToken ?? env.INVOCA_OAUTH_TOKEN,
    network: overrides.network ?? env.INVOCA_NETWORK,
    baseUrlOverrides: {
      ...overridesFromEnv,
      ...overrides.baseUrlOverrides,
    },
    timeoutMs:
      overrides.timeoutMs ??
      (env.INVOCA_TIMEOUT_MS ? Number(env.INVOCA_TIMEOUT_MS) : undefined),
    userAgent: overrides.userAgent ?? env.INVOCA_USER_AGENT,
    role: overrides.role ?? env.INVOCA_ROLE,
    advertiserId: overrides.advertiserId ?? env.INVOCA_ADVERTISER_ID,
    networkId: overrides.networkId ?? env.INVOCA_NETWORK_ID,
    affiliateId: overrides.affiliateId ?? env.INVOCA_AFFILIATE_ID,
  };

  const cleaned = Object.fromEntries(
    Object.entries(merged).filter(([, v]) => v !== undefined),
  );

  const parsed = InvocaConfigSchema.safeParse(cleaned);
  if (!parsed.success) {
    throw new InvocaError({
      code: "E_CONFIG",
      message: `Invalid configuration: ${parsed.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ")}`,
    });
  }
  return parsed.data;
}

export function hostFor(
  family: "ringPool" | "pnapi" | "signal" | "transactions",
  config: InvocaConfig,
): string {
  const override = config.baseUrlOverrides[family];
  if (override) return override;
  switch (family) {
    case "ringPool":
      return `https://${config.network}.invoca.net`;
    case "pnapi":
      return "https://pnapi.invoca.net";
    case "signal":
      return "https://invoca.net";
    case "transactions":
      return `https://${config.network}.invoca.net`;
  }
}

export function roleIdFor(role: Role, config: InvocaConfig): string | undefined {
  switch (role) {
    case "advertiser":
      return config.advertiserId;
    case "network":
      return config.networkId;
    case "affiliate":
      return config.affiliateId;
  }
}

export function envVarForRoleId(role: Role): string {
  switch (role) {
    case "advertiser":
      return "INVOCA_ADVERTISER_ID";
    case "network":
      return "INVOCA_NETWORK_ID";
    case "affiliate":
      return "INVOCA_AFFILIATE_ID";
  }
}

export function requireOauthToken(config: InvocaConfig): string {
  if (!config.oauthToken) {
    throw new InvocaError({
      code: "E_CONFIG",
      message:
        "Missing oauthToken. Set INVOCA_OAUTH_TOKEN or pass oauthToken to resolveConfig().",
      hint: "Get a token from your Invoca account settings, then export INVOCA_OAUTH_TOKEN=...",
    });
  }
  return config.oauthToken;
}
