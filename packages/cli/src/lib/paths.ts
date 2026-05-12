import { homedir } from "node:os";
import { join } from "node:path";

function fromEnv(key: string, fallback: string): string {
  const v = process.env[key];
  return v && v.length > 0 ? v : fallback;
}

export function configDir(): string {
  const xdg = fromEnv("XDG_CONFIG_HOME", join(homedir(), ".config"));
  return join(xdg, "invoca");
}

export function stateDir(): string {
  const xdg = fromEnv("XDG_STATE_HOME", join(homedir(), ".local", "state"));
  return join(xdg, "invoca");
}

export function profilesPath(): string {
  return join(configDir(), "profiles.json");
}

export function jobsLedgerPath(): string {
  return join(stateDir(), "jobs.jsonl");
}

export function feedbackLedgerPath(): string {
  return join(stateDir(), "feedback.jsonl");
}
