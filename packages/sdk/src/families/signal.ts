import type { InvocaConfig } from "../config.js";
import { hostFor, requireOauthToken } from "../config.js";
import { bearerHeader, request, requestContext } from "../http.js";
import {
  SignalApplyParamsSchema,
  SignalApplyResponseSchema,
  type SignalApplyParams,
  type SignalApplyResponse,
} from "../types/signal.js";

const API_VERSION = "2018-02-01";

export class SignalFamily {
  constructor(private readonly config: InvocaConfig) {}

  async apply(input: SignalApplyParams): Promise<SignalApplyResponse> {
    return this.send("POST", input);
  }

  async update(input: SignalApplyParams): Promise<SignalApplyResponse> {
    return this.send("PUT", input);
  }

  private async send(
    method: "POST" | "PUT",
    input: SignalApplyParams,
  ): Promise<SignalApplyResponse> {
    const params = SignalApplyParamsSchema.parse(input);
    const token = requireOauthToken(this.config);
    const host = hostFor("signal", this.config);

    return request({
      method,
      url: `${host}/api/${API_VERSION}/transactions.json`,
      body: params,
      headers: bearerHeader(token),
      schema: SignalApplyResponseSchema,
      ...requestContext(this.config),
    });
  }
}
