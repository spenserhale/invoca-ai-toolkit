import { InvocaError, isInvocaError } from "@invoca-toolkit/sdk";

export interface FormattedError {
  text: string;
  exitCode: number;
}

export function formatError(err: unknown): FormattedError {
  if (isInvocaError(err)) return formatInvocaError(err);
  if (err instanceof Error) {
    return {
      text: `error: ${err.message}`,
      exitCode: 1,
    };
  }
  return { text: `error: ${String(err)}`, exitCode: 1 };
}

function formatInvocaError(err: InvocaError): FormattedError {
  const parts: string[] = [`error[${err.code}]: ${err.message}`];
  if (err.got !== undefined) parts.push(`  got: "${err.got}"`);
  if (err.validValues && err.validValues.length > 0) {
    parts.push(`  valid: ${err.validValues.join(", ")}`);
  }
  if (err.hint) parts.push(`  hint: ${err.hint}`);
  return { text: parts.join("\n"), exitCode: err.exitCode };
}

export function exitOnError(err: unknown, exitFn: (code: number) => never = process.exit): never {
  const { text, exitCode } = formatError(err);
  process.stderr.write(`${text}\n`);
  return exitFn(exitCode);
}

export async function runCommand<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    exitOnError(err);
  }
}
