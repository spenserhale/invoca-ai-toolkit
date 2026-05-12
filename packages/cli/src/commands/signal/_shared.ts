import { readFile } from "node:fs/promises";
import { InvocaError } from "@invoca-toolkit/sdk";
import type { SignalApplyParams, SignalInput, CustomDataItem, SignalSearch } from "@invoca-toolkit/sdk";

export interface SignalFlags {
  readonly "transaction-id"?: string;
  readonly "call-record-id"?: string;
  readonly signal?: string | readonly string[];
  readonly custom?: string | readonly string[];
  readonly input?: string;
  readonly "call-in-progress": boolean;
}

function parseKvJson(raw: string, flag: string): { name: string; value: string } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      typeof (parsed as Record<string, unknown>)["name"] === "string" &&
      typeof (parsed as Record<string, unknown>)["value"] === "string"
    ) {
      return parsed as { name: string; value: string };
    }
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `--${flag} value must be a JSON object with "name" and "value" string fields`,
      got: raw,
    });
  } catch (err) {
    if (err instanceof InvocaError) throw err;
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `--${flag} value is not valid JSON`,
      got: raw,
      hint: `Pass a JSON object like: --${flag} '{"name":"sale","value":"true"}'`,
    });
  }
}

function parseSignalFlag(raw: string): SignalInput {
  const parsed = JSON.parse(raw) as unknown;
  if (
    parsed !== null &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    typeof (parsed as Record<string, unknown>)["name"] === "string"
  ) {
    return parsed as SignalInput;
  }
  throw new InvocaError({
    code: "E_VALIDATION",
    message: `--signal value must be a JSON object with at least a "name" field`,
    got: raw,
    hint: `Example: --signal '{"name":"sale","value":"true","partner_unique_id":"1"}'`,
  });
}

export async function buildSignalBody(flags: SignalFlags): Promise<SignalApplyParams> {
  const transactionId = flags["transaction-id"];
  const callRecordId = flags["call-record-id"];

  if (!transactionId && !callRecordId) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: "at least one of --transaction-id or --call-record-id is required",
    });
  }

  const search: SignalSearch = {};
  if (transactionId) search.transaction_id = transactionId;
  if (callRecordId) search.call_record_id = callRecordId;

  let signals: SignalInput[] | undefined;
  let customData: CustomDataItem[] | undefined;

  if (flags.input) {
    const src = flags.input === "-"
      ? await readFile("/dev/stdin", "utf-8")
      : await readFile(flags.input, "utf-8");
    const parsed = JSON.parse(src) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: "--input file must contain a JSON object with optional signals[] and custom_data[] arrays",
      });
    }
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj["signals"])) {
      signals = obj["signals"] as SignalInput[];
    }
    if (Array.isArray(obj["custom_data"])) {
      customData = obj["custom_data"] as CustomDataItem[];
    }
  } else {
    const rawSignals = flags.signal;
    if (rawSignals !== undefined) {
      const arr = Array.isArray(rawSignals) ? rawSignals : [rawSignals];
      signals = arr.map((s) => {
        try {
          return parseSignalFlag(s);
        } catch (err) {
          if (err instanceof InvocaError) throw err;
          throw new InvocaError({
            code: "E_VALIDATION",
            message: `--signal value is not valid JSON`,
            got: s,
            hint: `Example: --signal '{"name":"sale","value":"true"}'`,
          });
        }
      });
    }

    const rawCustom = flags.custom;
    if (rawCustom !== undefined) {
      const arr = Array.isArray(rawCustom) ? rawCustom : [rawCustom];
      customData = arr.map((c) => parseKvJson(c, "custom"));
    }
  }

  if ((!signals || signals.length === 0) && (!customData || customData.length === 0)) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: "at least one --signal or --custom entry is required (or use --input with a JSON file)",
    });
  }

  const body: SignalApplyParams = { search };
  if (signals && signals.length > 0) body.signals = signals;
  if (customData && customData.length > 0) body.custom_data = customData;
  if (flags["call-in-progress"]) body.call_in_progress = true;

  return body;
}

export const signalFlags = {
  "transaction-id": {
    kind: "parsed" as const,
    parse: String,
    brief: "Transaction ID of the call leg to apply signals to",
    optional: true,
  },
  "call-record-id": {
    kind: "parsed" as const,
    parse: String,
    brief: "Call record ID of the complete call to apply signals to",
    optional: true,
  },
  signal: {
    kind: "parsed" as const,
    parse: String,
    brief: 'Signal as JSON object: \'{"name":"sale","value":"true"}\' — repeat for multiple',
    optional: true,
  },
  custom: {
    kind: "parsed" as const,
    parse: String,
    brief: 'Custom data as JSON: \'{"name":"channel","value":"Paid Search"}\' — repeat for multiple',
    optional: true,
  },
  input: {
    kind: "parsed" as const,
    parse: String,
    brief: "JSON file (or - for stdin) with signals[] and/or custom_data[] arrays",
    optional: true,
  },
  "call-in-progress": {
    kind: "boolean" as const,
    brief: "Signal the call may still be in progress; Invoca returns 201 and applies later",
    default: false,
  },
} as const;
