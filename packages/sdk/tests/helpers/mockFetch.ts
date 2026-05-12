import { mock } from "bun:test";

export interface MockResponseInit {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  delayMs?: number;
  throwError?: unknown;
}

export interface MockCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

export interface MockFetchHandle {
  calls: MockCall[];
  restore: () => void;
  setResponses: (responses: MockResponseInit[]) => void;
}

const originalFetch = globalThis.fetch;

export function mockFetch(responses: MockResponseInit | MockResponseInit[]): MockFetchHandle {
  let queue: MockResponseInit[] = Array.isArray(responses) ? [...responses] : [responses];
  const calls: MockCall[] = [];

  const impl = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? "GET";
    const headers: Record<string, string> = {};
    if (init?.headers) {
      const h = new Headers(init.headers);
      h.forEach((v, k) => {
        headers[k] = v;
      });
    }
    const bodyText =
      typeof init?.body === "string"
        ? init.body
        : init?.body == null
          ? undefined
          : String(init.body);

    calls.push({ url, method, headers, body: bodyText });

    const next = queue.shift();
    if (!next) {
      throw new Error(`mockFetch: no response queued for ${method} ${url}`);
    }
    if (next.delayMs) {
      const signal = init?.signal;
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, next.delayMs);
        if (signal) {
          if (signal.aborted) {
            clearTimeout(timer);
            reject(new DOMException("aborted", "AbortError"));
            return;
          }
          signal.addEventListener(
            "abort",
            () => {
              clearTimeout(timer);
              reject(new DOMException("aborted", "AbortError"));
            },
            { once: true },
          );
        }
      });
    }
    if (next.throwError) {
      throw next.throwError;
    }
    const status = next.status ?? 200;
    const bodyOut =
      next.body === undefined
        ? ""
        : typeof next.body === "string"
          ? next.body
          : JSON.stringify(next.body);
    return new Response(bodyOut, {
      status,
      headers: {
        "Content-Type": "application/json",
        ...next.headers,
      },
    });
  };

  globalThis.fetch = mock(impl) as unknown as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
    setResponses: (next) => {
      queue = [...next];
    },
  };
}
