import { InvocaError } from "@invoca-toolkit/sdk";
import type { InvocaClient } from "@invoca-toolkit/sdk";

export const VALID_ROLES = ["advertiser", "network", "affiliate"] as const;
export type Role = (typeof VALID_ROLES)[number];

export const roleFlags = {
  as: {
    kind: "parsed",
    parse: String,
    brief: "Role perspective: advertiser, network, or affiliate",
    optional: false,
  },
  id: {
    kind: "parsed",
    parse: String,
    brief: "Advertiser, network, or affiliate ID",
    optional: false,
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
