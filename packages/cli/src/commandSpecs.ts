import { ErrorCode } from "@invoca-toolkit/sdk";
import { DELIVER_SCHEMES } from "./lib/deliver.js";
import { OUTPUT_FORMATS } from "./lib/output.js";

export interface FlagSpec {
  readonly name: string;
  readonly brief: string;
  readonly required?: boolean;
  readonly takesValue?: boolean;
  readonly values?: readonly string[];
  readonly default?: string;
}

export interface CommandSpec {
  readonly path: readonly string[];
  readonly brief: string;
  readonly positional?: readonly { name: string; brief: string }[];
  readonly flags?: readonly FlagSpec[];
  readonly examples?: readonly string[];
  readonly mutates?: boolean;
  readonly async?: boolean;
}

export const SCHEMA_VERSION = "1";

const FORMAT_FLAGS: readonly FlagSpec[] = OUTPUT_FORMATS.map((f) => ({
  name: `--${f}`,
  brief: `Output as ${f.toUpperCase()}${f === "toon" ? " (default)" : ""}`,
}));

const DELIVER_FLAG: FlagSpec = {
  name: "--deliver",
  brief: "Route output: stdout (default), file:<path>, webhook:<url>",
  takesValue: true,
  values: [...DELIVER_SCHEMES.map((s) => (s === "stdout" ? s : `${s}:<dest>`))],
};

const PROFILE_FLAG: FlagSpec = {
  name: "--profile",
  brief: "Named profile to load",
  takesValue: true,
};

const DRY_RUN_FLAG: FlagSpec = { name: "--dry-run", brief: "Validate; no side effects" };
const FORCE_FLAG: FlagSpec = { name: "--force", brief: "Bypass destructive-op guard" };
const IDEMPOTENCY_FLAG: FlagSpec = {
  name: "--idempotency-key",
  brief: "Caller key that dedupes retries via the local jobs ledger",
  takesValue: true,
};
const WAIT_FLAG: FlagSpec = { name: "--wait", brief: "Block until completion" };

export const baseSpecs: CommandSpec[] = [
  {
    path: ["agent-context"],
    brief: "Emit a machine-readable description of every command, flag, and error code",
    flags: [...FORMAT_FLAGS, DELIVER_FLAG],
    examples: ["invoca agent-context --json | jq '.schema_version'"],
  },
  {
    path: ["profile", "save"],
    brief: "Create or overwrite a named profile",
    positional: [{ name: "name", brief: "Profile name" }],
    flags: [
      { name: "--oauth-token", brief: "OAuth token", takesValue: true },
      { name: "--network", brief: "Network subdomain", takesValue: true },
      { name: "--timeout-ms", brief: "Request timeout (ms)", takesValue: true },
      { name: "--user-agent", brief: "User-Agent header", takesValue: true },
      ...FORMAT_FLAGS,
      DELIVER_FLAG,
    ],
    examples: ["invoca profile save staging --oauth-token sk_... --network demo"],
  },
  {
    path: ["profile", "list"],
    brief: "List saved profile names",
    flags: [...FORMAT_FLAGS, DELIVER_FLAG],
  },
  {
    path: ["profile", "show"],
    brief: "Show a profile (secrets redacted unless --reveal)",
    positional: [{ name: "name", brief: "Profile name" }],
    flags: [{ name: "--reveal", brief: "Include secrets in plain text" }, ...FORMAT_FLAGS, DELIVER_FLAG],
  },
  {
    path: ["profile", "delete"],
    brief: "Delete a saved profile (--force required)",
    positional: [{ name: "name", brief: "Profile name" }],
    flags: [FORCE_FLAG, DRY_RUN_FLAG, ...FORMAT_FLAGS, DELIVER_FLAG],
    mutates: true,
  },
  {
    path: ["jobs", "list"],
    brief: "List jobs from the local ledger (newest first, bounded)",
    flags: [
      { name: "--limit", brief: "Page size", takesValue: true, default: "20" },
      { name: "--cursor", brief: "Pagination cursor", takesValue: true },
      ...FORMAT_FLAGS,
      DELIVER_FLAG,
    ],
  },
  {
    path: ["jobs", "get"],
    brief: "Get a job by ID",
    positional: [{ name: "id", brief: "Job ID" }],
    flags: [...FORMAT_FLAGS, DELIVER_FLAG],
  },
  {
    path: ["jobs", "prune"],
    brief: "Drop ledger entries older than a duration (--force required)",
    flags: [
      { name: "--older-than", brief: "Duration <n><s|m|h|d>", takesValue: true, required: true },
      FORCE_FLAG,
      DRY_RUN_FLAG,
      ...FORMAT_FLAGS,
      DELIVER_FLAG,
    ],
    mutates: true,
  },
  {
    path: ["feedback"],
    brief: "Record feedback locally; POSTs upstream when INVOCA_FEEDBACK_ENDPOINT is set",
    positional: [{ name: "text", brief: "Feedback message" }],
    flags: [...FORMAT_FLAGS, DELIVER_FLAG],
  },
];

export const familySpecs: CommandSpec[] = [];

export function allSpecs(): CommandSpec[] {
  return [...baseSpecs, ...familySpecs];
}

export const FOUNDATION_FLAGS = {
  format: FORMAT_FLAGS,
  deliver: DELIVER_FLAG,
  profile: PROFILE_FLAG,
  dryRun: DRY_RUN_FLAG,
  force: FORCE_FLAG,
  idempotency: IDEMPOTENCY_FLAG,
  wait: WAIT_FLAG,
} as const;

export interface AgentContext {
  schema_version: string;
  cli: { name: string; version: string };
  formats: readonly string[];
  deliver_schemes: readonly string[];
  exit_codes: Record<string, number>;
  error_codes: readonly string[];
  flags: {
    format: readonly FlagSpec[];
    deliver: FlagSpec;
    profile: FlagSpec;
    dryRun: FlagSpec;
    force: FlagSpec;
    idempotency: FlagSpec;
    wait: FlagSpec;
  };
  commands: readonly CommandSpec[];
}

// Mirror of EXIT_CODES from SDK for serialization (keep in sync).
const EXIT_CODE_OF: Record<string, number> = {
  E_DRY_RUN: 0,
  E_NETWORK: 1,
  E_TIMEOUT: 1,
  E_VALIDATION: 2,
  E_CONFIG: 3,
  E_NOT_FOUND: 4,
  E_AUTH: 5,
  E_RATE_LIMIT: 6,
};

export function buildAgentContext(version: string): AgentContext {
  const exit_codes: Record<string, number> = {};
  for (const key of Object.keys(ErrorCode)) {
    const mapped = EXIT_CODE_OF[key];
    if (mapped !== undefined) exit_codes[key] = mapped;
  }
  return {
    schema_version: SCHEMA_VERSION,
    cli: { name: "invoca", version },
    formats: OUTPUT_FORMATS,
    deliver_schemes: ["stdout", "file:<path>", "webhook:<url>"],
    exit_codes,
    error_codes: Object.keys(ErrorCode),
    flags: FOUNDATION_FLAGS,
    commands: allSpecs(),
  };
}
