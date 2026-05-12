import type { InvocaConfig } from "../config.js";
import { hostFor, requireOauthToken } from "../config.js";
import { bearerHeader, request, requestContext } from "../http.js";
import {
  TransactionsQueryParamsSchema,
  TransactionsPageSchema,
  type TransactionsQueryParams,
  type TransactionsPage,
} from "../types/transactions.js";

const API_VERSION = "2020-10-01";
type Role = "advertiser" | "network" | "affiliate";

export class TransactionsFamily {
  constructor(private readonly config: InvocaConfig) {}

  advertiser(advertiserId: string, params?: TransactionsQueryParams) {
    return this.list("advertiser", advertiserId, params);
  }

  network(networkId: string, params?: TransactionsQueryParams) {
    return this.list("network", networkId, params);
  }

  affiliate(affiliateId: string, params?: TransactionsQueryParams) {
    return this.list("affiliate", affiliateId, params);
  }

  private async list(
    role: Role,
    id: string,
    params?: TransactionsQueryParams,
  ): Promise<TransactionsPage> {
    const parsed = TransactionsQueryParamsSchema.parse(params ?? {});
    const token = requireOauthToken(this.config);
    const host = hostFor("transactions", this.config);
    const format = parsed.format ?? "json";

    const query: Record<string, string | number | undefined> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (k === "format") continue;
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        query[k] = v.join(",");
      } else {
        query[k] = typeof v === "string" ? v : String(v);
      }
    }

    return request({
      method: "GET",
      url: `${host}/api/${API_VERSION}/${role}s/transactions/${encodeURIComponent(id)}.${format}`,
      query,
      headers: bearerHeader(token),
      schema: TransactionsPageSchema,
      ...requestContext(this.config),
    });
  }
}
