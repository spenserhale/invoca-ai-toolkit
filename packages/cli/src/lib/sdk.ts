import { InvocaClient, resolveConfig, type InvocaConfig } from "@invoca-toolkit/sdk";
import { loadProfile } from "./profiles.js";

export interface SdkFactoryFlags {
  readonly profile?: string;
}

export function resolveCliConfig(flags: SdkFactoryFlags = {}): InvocaConfig {
  const profile = flags.profile ? loadProfile(flags.profile) : undefined;
  return resolveConfig(profile);
}

export function buildClient(flags: SdkFactoryFlags = {}): InvocaClient {
  return new InvocaClient(resolveCliConfig(flags));
}

export function buildClientFromConfig(config: InvocaConfig): InvocaClient {
  return new InvocaClient(config);
}
