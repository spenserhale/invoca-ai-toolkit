import { existsSync, createWriteStream, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { buildClient } from "../../lib/sdk.js";
import { profileFlag, safetyFlags } from "../../lib/flags.js";
import { assertRole, fetchOne, roleFlags } from "./_shared.js";

interface Flags {
  readonly as: string;
  readonly id: string;
  readonly to: string;
  readonly force: boolean;
  readonly "dry-run": boolean;
  readonly profile?: string;
}

export const transactionsDownloadCommand = buildCommand({
  docs: {
    brief: "Download the call recording for a transaction (refreshes the signed URL)",
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          parse: String,
          brief: "Transaction ID",
          placeholder: "transaction_id",
        },
      ],
    },
    flags: {
      ...roleFlags,
      to: {
        kind: "parsed",
        parse: String,
        brief: "Destination file path (.mp3)",
        optional: false,
      },
      ...safetyFlags,
      ...profileFlag,
    },
  },
  async func(this: void, flags: Flags, transactionId: string) {
    await runCommand(async () => {
      const role = assertRole(flags.as);
      const outPath = resolve(flags.to);

      if (existsSync(outPath) && !flags.force && !flags["dry-run"]) {
        throw new InvocaError({
          code: "E_VALIDATION",
          message: `destination file already exists; pass --force to overwrite`,
          got: outPath,
        });
      }

      const client = buildClient(flags);
      const transaction = await fetchOne(client, role, flags.id, transactionId);
      const url = transaction.recording_download_url as string | undefined;
      if (!url) {
        throw new InvocaError({
          code: "E_NOT_FOUND",
          message: `no recording_download_url on transaction (call may not have a recording)`,
          got: transactionId,
        });
      }

      if (flags["dry-run"]) {
        process.stderr.write(
          `dry_run: would stream <signed-s3-url> -> ${outPath}\n`,
        );
        return;
      }

      mkdirSync(dirname(outPath), { recursive: true });
      const tmp = `${outPath}.invoca-tmp-${process.pid}`;
      const res = await fetch(url);
      if (!res.ok || !res.body) {
        throw new InvocaError({
          code: "E_NETWORK",
          message: `recording download failed: ${res.status} ${res.statusText}`,
          statusCode: res.status,
        });
      }
      await pipeline(
        Readable.fromWeb(res.body as never),
        createWriteStream(tmp),
      );
      const { renameSync } = await import("node:fs");
      renameSync(tmp, outPath);
      process.stderr.write(`downloaded ${transactionId} -> ${outPath}\n`);
    });
  },
});
