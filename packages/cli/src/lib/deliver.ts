import { writeFile, rename, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { InvocaError } from "@invoca-toolkit/sdk";
import type { OutputFormat } from "./output.js";

export const DELIVER_SCHEMES = ["stdout", "file", "webhook"] as const;
export type DeliverScheme = (typeof DELIVER_SCHEMES)[number];

const CONTENT_TYPES: Record<OutputFormat, string> = {
  toon: "text/toon",
  json: "application/json",
  csv: "text/csv",
};

export async function deliver(
  payload: string,
  target: string | undefined,
  format: OutputFormat,
): Promise<void> {
  if (!target || target === "stdout") {
    process.stdout.write(payload);
    if (!payload.endsWith("\n")) process.stdout.write("\n");
    return;
  }

  if (target.startsWith("file:")) {
    const path = target.slice("file:".length);
    if (!path) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: `--deliver file: requires a path (got: "${target}")`,
      });
    }
    await mkdir(dirname(path), { recursive: true });
    const tmp = `${path}.invoca-tmp-${process.pid}`;
    await writeFile(tmp, payload);
    await rename(tmp, path);
    return;
  }

  if (target.startsWith("webhook:")) {
    const url = target.slice("webhook:".length);
    if (!url) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: `--deliver webhook: requires a URL (got: "${target}")`,
      });
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": CONTENT_TYPES[format] },
      body: payload,
    });
    if (!res.ok) {
      throw new InvocaError({
        code: "E_NETWORK",
        message: `webhook POST ${url} returned ${res.status}`,
        statusCode: res.status,
      });
    }
    return;
  }

  throw new InvocaError({
    code: "E_VALIDATION",
    message: `--deliver scheme not recognized`,
    got: target,
    validValues: ["stdout", "file:<path>", "webhook:<url>"],
  });
}
