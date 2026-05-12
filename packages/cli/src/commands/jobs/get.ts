import { buildCommand } from "@stricli/core";
import { InvocaError } from "@invoca-toolkit/sdk";
import { runCommand } from "../../lib/errors.js";
import { getJob } from "../../lib/jobs.js";
import { emit } from "../../lib/render.js";
import { formatFlags, deliverFlag } from "../../lib/flags.js";

interface Flags {
  readonly toon: boolean;
  readonly json: boolean;
  readonly csv: boolean;
  readonly deliver?: string;
}

export const jobsGetCommand = buildCommand({
  docs: { brief: "Get a single job by ID" },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [{ parse: String, brief: "Job ID", placeholder: "id" }],
    },
    flags: { ...formatFlags, ...deliverFlag },
  },
  async func(this: void, flags: Flags, id: string) {
    await runCommand(async () => {
      const job = getJob(id);
      if (!job) {
        throw new InvocaError({
          code: "E_NOT_FOUND",
          message: `job not found`,
          got: id,
        });
      }
      await emit(job, flags);
    });
  },
});
