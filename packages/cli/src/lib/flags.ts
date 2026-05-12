export const formatFlags = {
  toon: {
    kind: "boolean",
    brief: "Output as TOON (default)",
    default: false,
  },
  json: {
    kind: "boolean",
    brief: "Output as JSON",
    default: false,
  },
  csv: {
    kind: "boolean",
    brief: "Output as CSV (flat rows only)",
    default: false,
  },
} as const;

export const safetyFlags = {
  "dry-run": {
    kind: "boolean",
    brief: "Validate and print what would happen; perform no side effects",
    default: false,
  },
  force: {
    kind: "boolean",
    brief: "Bypass confirmation on destructive operations",
    default: false,
  },
} as const;

export const profileFlag = {
  profile: {
    kind: "parsed",
    parse: String,
    brief: "Named profile to load (see `invoca profile list`)",
    optional: true,
  },
} as const;

export const deliverFlag = {
  deliver: {
    kind: "parsed",
    parse: String,
    brief: "Route output to stdout (default), file:<path>, or webhook:<url>",
    optional: true,
  },
} as const;

export const idempotencyFlag = {
  "idempotency-key": {
    kind: "parsed",
    parse: String,
    brief: "Deduplicate retried mutations under this caller-provided key",
    optional: true,
  },
} as const;

const parsePositiveInt = (s: string): number => {
  const n = Number(s);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`expected a positive integer (got: "${s}")`);
  }
  return n;
};

export const paginationFlags = {
  limit: {
    kind: "parsed",
    parse: parsePositiveInt,
    brief: "Maximum number of items to return",
    optional: true,
  },
  cursor: {
    kind: "parsed",
    parse: String,
    brief: "Pagination cursor from a previous response",
    optional: true,
  },
} as const;

export const waitFlag = {
  wait: {
    kind: "boolean",
    brief: "Block until async operation completes",
    default: false,
  },
} as const;

export const DEFAULT_LIST_LIMIT = 20;
