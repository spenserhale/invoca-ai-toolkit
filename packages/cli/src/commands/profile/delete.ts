import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { deleteProfile } from "../../lib/profiles.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag, safetyFlags } from "../../lib/flags.js";

interface Flags {
  readonly force: boolean;
  readonly "dry-run": boolean;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const profileDeleteCommand = buildCommand({
  docs: { brief: "Delete a saved profile (requires --force)" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ parse: String, brief: "Profile name", placeholder: "name" }],
    },
    flags: { ...safetyFlags, ...formatFlags, ...deliverFlag },
  },
  async func(this: void, flags: Flags, name: string) {
    await runCommand(async () => {
      if (!flags.force && !flags["dry-run"]) {
        throw new InvocaError({
          code: "E_VALIDATION",
          message: "profile delete is destructive; pass --force to confirm",
          hint: "or use --dry-run to preview",
        });
      }
      if (flags["dry-run"]) {
        await emit({ status: "dry_run", would_delete: name }, flags);
        return;
      }
      const deleted = deleteProfile(name);
      await emit({ deleted, name }, flags);
    });
  },
});
