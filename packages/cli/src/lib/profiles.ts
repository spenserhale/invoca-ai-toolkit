import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { z } from "zod";
import { InvocaError } from "@invoca-toolkit/sdk";
import { profilesPath } from "./paths.js";

const ProfileSchema = z.object({
  oauthToken: z.string().min(1).optional(),
  network: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  userAgent: z.string().optional(),
  baseUrlOverrides: z
    .object({
      pnapi: z.string().url().optional(),
      signal: z.string().url().optional(),
      transactions: z.string().url().optional(),
      ringPool: z.string().url().optional(),
    })
    .optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

const FileSchema = z.record(z.string(), ProfileSchema);

function readAll(): Record<string, Profile> {
  const path = profilesPath();
  if (!existsSync(path)) return {};
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    throw new InvocaError({
      code: "E_CONFIG",
      message: `Profiles file at ${path} is not valid JSON`,
      cause: err,
    });
  }
  const parsed = FileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new InvocaError({
      code: "E_CONFIG",
      message: `Profiles file at ${path} did not match expected shape`,
      hint: parsed.error.issues
        .slice(0, 3)
        .map((i) => i.message)
        .join("; "),
    });
  }
  return parsed.data;
}

function writeAll(all: Record<string, Profile>): void {
  const path = profilesPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(all, null, 2)}\n`, { mode: 0o600 });
}

export function listProfileNames(): string[] {
  return Object.keys(readAll()).sort();
}

export function getProfile(name: string): Profile | undefined {
  return readAll()[name];
}

export function loadProfile(name: string): Profile {
  const p = getProfile(name);
  if (!p) {
    throw new InvocaError({
      code: "E_CONFIG",
      message: `profile not found`,
      got: name,
      validValues: listProfileNames(),
      hint: "Create one with `invoca profile save <name> --oauth-token <token>`",
    });
  }
  return p;
}

export function saveProfile(name: string, profile: Profile): void {
  if (!/^[a-zA-Z0-9_.-]+$/.test(name)) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: "profile name may only contain letters, digits, dot, dash, underscore",
      got: name,
    });
  }
  const all = readAll();
  all[name] = profile;
  writeAll(all);
}

export function deleteProfile(name: string): boolean {
  const all = readAll();
  if (!(name in all)) return false;
  delete all[name];
  writeAll(all);
  return true;
}

export function redactProfile(profile: Profile): Profile {
  const copy: Profile = { ...profile };
  if (copy.oauthToken) copy.oauthToken = "REDACTED";
  return copy;
}
