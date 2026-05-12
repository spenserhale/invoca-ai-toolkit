import { buildCommand } from "@stricli/core";
import { runCommand } from "../../lib/errors.js";
import { listProfileNames } from "../../lib/profiles.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag } from "../../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const profileListCommand = buildCommand({
  docs: { brief: "List saved profile names" },
  parameters: { flags: { ...formatFlags, ...deliverFlag } },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const names = listProfileNames();
      await emit({ profiles: names, total: names.length }, flags);
    });
  },
});
