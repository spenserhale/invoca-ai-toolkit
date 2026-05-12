import { buildCommand } from "@stricli/core";
import { runCommand } from "../lib/errors.js";
import { emit } from "../lib/render.js";
import { formatFlags, deliverFlag } from "../lib/flags.js";
import { buildAgentContext } from "../commandSpecs.js";
import { CLI_VERSION } from "../version.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const agentContextCommand = buildCommand({
  docs: { brief: "Emit a machine-readable description of every command and flag" },
  parameters: { flags: { ...formatFlags, ...deliverFlag } },
  async func(this: void, flags: Flags) {
    await runCommand(async () => {
      const effective: Flags = flags.toon || flags.json || flags.csv ? flags : { ...flags, json: true };
      await emit(buildAgentContext(CLI_VERSION), effective);
    });
  },
});
