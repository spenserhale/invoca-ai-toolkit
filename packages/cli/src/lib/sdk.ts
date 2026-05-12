import { InvocaClient, resolveConfig, type InvocaConfig } from "@invoca-toolkit/sdk";
import { loadProfile } from "./profiles.js";

export interface SdkFactoryFlags {
  readonly profile?: string;
}

export function buildClient(flags: SdkFactoryFlags = {}): InvocaClient {
  const profile = flags.profile ? loadProfile(flags.profile) : undefined;
  const config: InvocaConfig = resolveConfig(profile);
  return new InvocaClient(config);
}
