export const ErrorCode = {
  E_NETWORK: "E_NETWORK",
  E_TIMEOUT: "E_TIMEOUT",
  E_VALIDATION: "E_VALIDATION",
  E_CONFIG: "E_CONFIG",
  E_NOT_FOUND: "E_NOT_FOUND",
  E_AUTH: "E_AUTH",
  E_RATE_LIMIT: "E_RATE_LIMIT",
  E_DRY_RUN: "E_DRY_RUN",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const EXIT_CODES: Record<ErrorCode, number> = {
  E_DRY_RUN: 0,
  E_NETWORK: 1,
  E_TIMEOUT: 1,
  E_VALIDATION: 2,
  E_CONFIG: 3,
  E_NOT_FOUND: 4,
  E_AUTH: 5,
  E_RATE_LIMIT: 6,
};

export interface InvocaErrorInit {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  hint?: string;
  validValues?: readonly string[];
  got?: string;
  cause?: unknown;
}

export class InvocaError extends Error {
  readonly code: ErrorCode;
  readonly exitCode: number;
  readonly statusCode?: number;
  readonly hint?: string;
  readonly validValues?: readonly string[];
  readonly got?: string;

  constructor(init: InvocaErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.name = "InvocaError";
    this.code = init.code;
    this.exitCode = EXIT_CODES[init.code];
    this.statusCode = init.statusCode;
    this.hint = init.hint;
    this.validValues = init.validValues;
    this.got = init.got;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      exitCode: this.exitCode,
      statusCode: this.statusCode,
      hint: this.hint,
      validValues: this.validValues,
      got: this.got,
    };
  }
}

export function isInvocaError(value: unknown): value is InvocaError {
  return value instanceof InvocaError;
}
