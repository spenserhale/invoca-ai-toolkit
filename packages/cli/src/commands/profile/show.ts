import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { loadProfile, redactProfile } from "../../lib/profiles.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag } from "../../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
  readonly reveal: boolean;
}

export const profileShowCommand = buildCommand({
  docs: { brief: "Show a profile (secrets redacted unless --reveal)" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ parse: String, brief: "Profile name", placeholder: "name" }],
    },
    flags: {
      reveal: {
        kind: "boolean",
        brief: "Include the oauth token in plain text",
        default: false,
      },
      ...formatFlags,
      ...deliverFlag,
    },
  },
  async func(this: void, flags: Flags, name: string) {
    await runCommand(async () => {
      const profile = loadProfile(name);
      await emit(
        { name, profile: flags.reveal ? profile : redactProfile(profile) },
        flags,
      );
    });
  },
});
