import type { z } from "zod";
import { InvocaError } from "./errors.js";
import type { InvocaConfig } from "./config.js";

export interface RequestOptions<T> {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  schema: z.ZodType<T>;
  timeoutMs?: number;
  retries?: number;
  userAgent?: string;
}

const DEFAULT_RETRIES_BY_METHOD: Record<RequestOptions<unknown>["method"], number> = {
  GET: 2,
  HEAD: 2,
  PUT: 1,
  DELETE: 1,
  POST: 0,
  PATCH: 0,
} as unknown as Record<RequestOptions<unknown>["method"], number>;

function buildUrl(url: string, query?: RequestOptions<unknown>["query"]): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    params.append(k, String(v));
  }
  const qs = params.toString();
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

function backoffDelay(attempt: number): number {
  return Math.min(500 * 2 ** attempt, 4_000) + Math.floor(Math.random() * 250);
}

export async function request<T>(opts: RequestOptions<T>): Promise<T> {
  const url = buildUrl(opts.url, opts.query);
  const maxRetries =
    opts.retries ?? DEFAULT_RETRIES_BY_METHOD[opts.method] ?? 0;
  const timeoutMs = opts.timeoutMs ?? 30_000;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": opts.userAgent ?? "invoca-toolkit",
    ...opts.headers,
  };
  let body: BodyInit | undefined;
  if (opts.body !== undefined && opts.body !== null) {
    headers["Content-Type"] ??= "application/json";
    body = JSON.stringify(opts.body);
  }

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: opts.method,
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const text = await res.text();
        const parsed = text ? safeJsonParse(text) : undefined;
        const validated = opts.schema.safeParse(parsed);
        if (!validated.success) {
          throw new InvocaError({
            code: "E_VALIDATION",
            message: `Response did not match expected schema for ${opts.method} ${redactUrl(url)}`,
            hint: validated.error.issues
              .slice(0, 3)
              .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
              .join("; "),
            cause: validated.error,
          });
        }
        return validated.data;
      }

      const errorBody = await res.text().catch(() => "");
      const err = mapHttpError(res.status, errorBody, opts.method, url);
      if (isRetryable(res.status) && attempt < maxRetries) {
        await sleep(backoffDelay(attempt));
        lastError = err;
        continue;
      }
      throw err;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof InvocaError) throw err;
      const isAbort =
        err instanceof DOMException && err.name === "AbortError";
      if (isAbort) {
        const e = new InvocaError({
          code: "E_TIMEOUT",
          message: `Request to ${redactUrl(url)} timed out after ${timeoutMs}ms`,
          cause: err,
        });
        if (attempt < maxRetries) {
          lastError = e;
          await sleep(backoffDelay(attempt));
          continue;
        }
        throw e;
      }
      const e = new InvocaError({
        code: "E_NETWORK",
        message: `Network error during ${opts.method} ${redactUrl(url)}: ${
          err instanceof Error ? err.message : String(err)
        }`,
        cause: err,
      });
      if (attempt < maxRetries) {
        lastError = e;
        await sleep(backoffDelay(attempt));
        continue;
      }
      throw e;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new InvocaError({ code: "E_NETWORK", message: "Request failed" });
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function mapHttpError(
  status: number,
  body: string,
  method: string,
  url: string,
): InvocaError {
  const snippet = body ? ` — ${truncate(body, 200)}` : "";
  if (status === 401 || status === 403) {
    return new InvocaError({
      code: "E_AUTH",
      message: `Authentication rejected (${status}) for ${method} ${redactUrl(url)}${snippet}`,
      statusCode: status,
      hint: "Verify INVOCA_OAUTH_TOKEN or ring_pool_key for this call.",
    });
  }
  if (status === 404) {
    return new InvocaError({
      code: "E_NOT_FOUND",
      message: `Not found (404) for ${method} ${redactUrl(url)}${snippet}`,
      statusCode: 404,
    });
  }
  if (status === 429) {
    return new InvocaError({
      code: "E_RATE_LIMIT",
      message: `Rate limited (429) for ${method} ${redactUrl(url)}${snippet}`,
      statusCode: 429,
      hint: "Retry with exponential backoff or reduce request rate.",
    });
  }
  if (status >= 400 && status < 500) {
    return new InvocaError({
      code: "E_VALIDATION",
      message: `Request rejected (${status}) for ${method} ${redactUrl(url)}${snippet}`,
      statusCode: status,
    });
  }
  return new InvocaError({
    code: "E_NETWORK",
    message: `Server error (${status}) for ${method} ${redactUrl(url)}${snippet}`,
    statusCode: status,
  });
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    const params = new URLSearchParams(u.search);
    for (const k of ["oauth_token", "ring_pool_key", "access_token"]) {
      if (params.has(k)) params.set(k, "REDACTED");
    }
    u.search = params.toString();
    return u.toString();
  } catch {
    return url;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function authHeader(token: string): Record<string, string> {
  return { Authorization: token };
}

export const bearerHeader = authHeader;

export function requestContext(config: InvocaConfig) {
  return {
    timeoutMs: config.timeoutMs,
    userAgent: config.userAgent,
  };
}
