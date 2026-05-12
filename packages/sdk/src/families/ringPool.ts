import type { InvocaConfig } from "../config.js";
import { hostFor } from "../config.js";
import { request, requestContext } from "../http.js";
import {
  RingPoolAllocateParamsSchema,
  RingPoolAllocationSchema,
  type RingPoolAllocateParams,
  type RingPoolAllocation,
} from "../types/ringPool.js";

const API_VERSION = "2015-12-09";

export class RingPoolFamily {
  constructor(private readonly config: InvocaConfig) {}

  async allocate(input: RingPoolAllocateParams): Promise<RingPoolAllocation> {
    const params = RingPoolAllocateParamsSchema.parse(input);
    const host = hostFor("ringPool", this.config);
    const { ringPoolId, ringPoolKey, format = "json", ...rest } = params;

    const query: Record<string, string | number | undefined> = {
      ring_pool_key: ringPoolKey,
    };
    for (const [k, v] of Object.entries(rest)) {
      if (v === undefined || v === null) continue;
      query[k] = typeof v === "string" ? v : String(v);
    }

    return request({
      method: "GET",
      url: `${host}/api/${API_VERSION}/ring_pools/${encodeURIComponent(ringPoolId)}/allocate_number.${format}`,
      query,
      schema: RingPoolAllocationSchema,
      ...requestContext(this.config),
    });
  }
}
