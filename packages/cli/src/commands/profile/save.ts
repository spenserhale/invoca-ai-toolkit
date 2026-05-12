import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { saveProfile } from "../../lib/profiles.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag } from "../../lib/flags.js";

interface Flags {
  readonly "oauth-token"?: string;
  readonly network?: string;
  readonly "timeout-ms"?: number;
  readonly "user-agent"?: string;
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const profileSaveCommand = buildCommand({
  docs: { brief: "Create or overwrite a named profile" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          parse: String,
          brief: "Profile name (a-z, 0-9, dot, dash, underscore)",
          placeholder: "name",
        },
      ],
    },
    flags: {
      "oauth-token": {
        kind: "parsed",
        parse: String,
        brief: "OAuth token to store under this profile",
        optional: true,
      },
      network: {
        kind: "parsed",
        parse: String,
        brief: "Network subdomain (e.g. mynetwork for mynetwork.invoca.net)",
        optional: true,
      },
      "timeout-ms": {
        kind: "parsed",
        parse: Number,
        brief: "Request timeout in milliseconds",
        optional: true,
      },
      "user-agent": {
        kind: "parsed",
        parse: String,
        brief: "User-Agent header value",
        optional: true,
      },
      ...formatFlags,
      ...deliverFlag,
    },
  },
  async func(this: void, flags: Flags, name: string) {
    await runCommand(async () => {
      saveProfile(name, {
        oauthToken: flags["oauth-token"],
        network: flags.network,
        timeoutMs: flags["timeout-ms"],
        userAgent: flags["user-agent"],
      });
      await emit({ saved: name }, flags);
    });
  },
});
