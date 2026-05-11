import type {
  InvocaConfig,
  Resource,
  ListResourcesParams,
  CreateResourceParams,
  PaginatedResponse,
} from "./types.js";
import {
  InvocaConfigSchema,
  ResourceSchema,
  PaginatedResponseSchema,
  ErrorResponseSchema,
} from "./types.js";
import { InvocaError, InvocaAuthError } from "./errors.js";

export class InvocaClient {
  private readonly config: InvocaConfig;

  constructor(config: Partial<InvocaConfig> & { apiKey: string }) {
    this.config = InvocaConfigSchema.parse(config);
  }

  // -------------------------------------------------------------------------
  // HTTP helpers
  // -------------------------------------------------------------------------

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      if (res.status === 401) throw new InvocaAuthError();

      const errorBody = await res.json().catch(() => null);
      const parsed = ErrorResponseSchema.safeParse(errorBody);

      throw new InvocaError(
        parsed.success ? parsed.data.error.message : `HTTP ${res.status}`,
        parsed.success ? parsed.data.error.code : "UNKNOWN",
        res.status
      );
    }

    return res.json() as Promise<T>;
  }

  // -------------------------------------------------------------------------
  // Resource operations -- add your own here
  // -------------------------------------------------------------------------

  async listResources(
    params: ListResourcesParams = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<Resource>> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });
    return this.request("GET", `/resources?${query}`);
  }

  async getResource(id: string): Promise<Resource> {
    return this.request("GET", `/resources/${id}`);
  }

  async createResource(params: CreateResourceParams): Promise<Resource> {
    return this.request("POST", "/resources", params);
  }

  async deleteResource(id: string): Promise<void> {
    await this.request("DELETE", `/resources/${id}`);
  }
}
