import { InvocaError, envVarForRoleId, roleIdFor } from "@invoca-toolkit/sdk";
import type { InvocaClient, InvocaConfig, Role } from "@invoca-toolkit/sdk";

export const VALID_ROLES = ["advertiser", "network", "affiliate"] as const;
export type { Role };

export const roleFlags = {
  as: {
    kind: "parsed",
    parse: String,
    brief:
      "Role perspective: advertiser, network, or affiliate (defaults to $INVOCA_ROLE)",
    optional: true,
  },
  id: {
    kind: "parsed",
    parse: String,
    brief:
      "Role ID (defaults to $INVOCA_ADVERTISER_ID / _NETWORK_ID / _AFFILIATE_ID for the resolved role)",
    optional: true,
  },
} as const;

export function assertRole(value: string): Role {
  if (!VALID_ROLES.includes(value as Role)) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `--as must be one of: ${VALID_ROLES.join(", ")}`,
      got: value,
      validValues: [...VALID_ROLES],
    });
  }
  return value as Role;
}

export interface ResolvedRoleAndId {
  readonly role: Role;
  readonly id: string;
  readonly roleSource: "flag" | "env";
  readonly idSource: "flag" | "env";
}

export function resolveRoleAndId(
  flags: { readonly as?: string; readonly id?: string },
  config: InvocaConfig,
): ResolvedRoleAndId {
  let role: Role;
  let roleSource: "flag" | "env";
  if (flags.as) {
    role = assertRole(flags.as);
    roleSource = "flag";
  } else if (config.role) {
    role = config.role;
    roleSource = "env";
  } else {
    throw new InvocaError({
      code: "E_CONFIG",
      message: "role is not configured",
      validValues: [...VALID_ROLES],
      hint:
        "pass --as advertiser|network|affiliate, or export INVOCA_ROLE=advertiser " +
        "in your shell rc (and INVOCA_ADVERTISER_ID=<your-id> while you're at it)",
    });
  }

  let id: string;
  let idSource: "flag" | "env";
  if (flags.id) {
    id = flags.id;
    idSource = "flag";
  } else {
    const fromEnv = roleIdFor(role, config);
    if (!fromEnv) {
      throw new InvocaError({
        code: "E_CONFIG",
        message: `role ID not configured for role "${role}"`,
        hint: `pass --id <id>, or export ${envVarForRoleId(role)}=<your-id> in your shell rc`,
      });
    }
    id = fromEnv;
    idSource = "env";
  }

  return { role, id, roleSource, idSource };
}

export async function fetchOne(
  client: InvocaClient,
  role: Role,
  roleId: string,
  transactionId: string,
): Promise<Record<string, unknown>> {
  const fetcher = client.transactions[role].bind(client.transactions);
  const page = await fetcher(roleId, { transaction_id: transactionId });
  const rows = Array.isArray(page) ? page : page.transactions;
  const found = rows[0] as Record<string, unknown> | undefined;
  if (!found) {
    throw new InvocaError({
      code: "E_NOT_FOUND",
      message: `transaction not found`,
      got: transactionId,
      hint: `verify the ID exists for ${role} ${roleId}, and that it falls within the API's retention window`,
    });
  }
  return found;
}
