import { InvocaError } from "../errors.js";
import type { InvocaConfig } from "../config.js";
import { hostFor } from "../config.js";
import { request, requestContext } from "../http.js";
import {
  BulkRingPoolAllocateRequestsSchema,
  BulkRingPoolResponseBodySchema,
  type BulkRingPoolAllocateRequest,
  type BulkRingPoolAllocation,
} from "../types/bulkRingPool.js";

const API_VERSION = "2013-07-01";

function buildApiSuffix(req: BulkRingPoolAllocateRequest): string {
  const { ring_pool_id, ring_pool_key, request_id: _rid, ...rest } = req;
  const params = new URLSearchParams({ ring_pool_key });
  for (const [k, v] of Object.entries(rest)) {
    params.append(k, String(v));
  }
  return `${ring_pool_id}/allocate_number.json?${params.toString()}`;
}

export class BulkRingPoolFamily {
  constructor(private readonly config: InvocaConfig) {}

  async allocate(
    requests: BulkRingPoolAllocateRequest[],
  ): Promise<BulkRingPoolAllocation[]> {
    const validated = BulkRingPoolAllocateRequestsSchema.safeParse(requests);
    if (!validated.success) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: `Invalid bulk ring pool allocation requests: ${validated.error.issues
          .slice(0, 3)
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ")}`,
        cause: validated.error,
      });
    }

    const host = hostFor("pnapi", this.config);
    const wireRequests = validated.data.map((req) => {
      const entry: Record<string, string> = {
        api_suffix: buildApiSuffix(req),
      };
      if (req.request_id !== undefined) entry.request_id = req.request_id;
      return entry;
    });

    const result = await request({
      method: "POST",
      url: `${host}/api/${API_VERSION}/bulk.json`,
      body: { requests: wireRequests },
      schema: BulkRingPoolResponseBodySchema,
      ...requestContext(this.config),
    });

    return result.responses;
  }
}
