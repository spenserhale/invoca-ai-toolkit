import type { InvocaConfig } from "./types.js";

/**
 * Resolve configuration from environment variables.
 * Useful for both CLI and MCP contexts.
 */
export function resolveConfig(
  overrides: Partial<InvocaConfig> = {}
): InvocaConfig {
  return {
    apiKey: overrides.apiKey ?? process.env.INVOCA_API_KEY ?? "",
    baseUrl:
      overrides.baseUrl ??
      process.env.INVOCA_BASE_URL ??
      "https://api.invoca.com",
  };
}
