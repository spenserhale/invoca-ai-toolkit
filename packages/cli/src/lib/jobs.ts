import { existsSync, readFileSync, appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { randomUUID } from "node:crypto";
import { jobsLedgerPath } from "./paths.js";

export interface JobRecord {
  id: string;
  command: string;
  idempotencyKey?: string;
  startedAt: string;
  finishedAt?: string;
  status: "pending" | "succeeded" | "failed";
  summary?: string;
}

function readAll(): JobRecord[] {
  const path = jobsLedgerPath();
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JobRecord);
}

function append(record: JobRecord): void {
  const path = jobsLedgerPath();
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(record)}\n`);
}

export function findByIdempotencyKey(key: string): JobRecord | undefined {
  return readAll().find((r) => r.idempotencyKey === key);
}

export function startJob(command: string, idempotencyKey?: string): JobRecord {
  if (idempotencyKey) {
    const existing = findByIdempotencyKey(idempotencyKey);
    if (existing) return existing;
  }
  const record: JobRecord = {
    id: `job_${randomUUID()}`,
    command,
    idempotencyKey,
    startedAt: new Date().toISOString(),
    status: "pending",
  };
  append(record);
  return record;
}

export function finishJob(id: string, status: "succeeded" | "failed", summary?: string): JobRecord {
  const all = readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) {
    const record: JobRecord = {
      id,
      command: "(unknown)",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      status,
      summary,
    };
    append(record);
    return record;
  }
  const updated: JobRecord = {
    ...all[idx]!,
    finishedAt: new Date().toISOString(),
    status,
    summary,
  };
  all[idx] = updated;
  const path = jobsLedgerPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${all.map((r) => JSON.stringify(r)).join("\n")}\n`);
  return updated;
}

export function listJobs(): JobRecord[] {
  return readAll();
}

export function getJob(id: string): JobRecord | undefined {
  return readAll().find((r) => r.id === id);
}

export function pruneJobs(olderThanMs: number): number {
  const cutoff = Date.now() - olderThanMs;
  const all = readAll();
  const kept = all.filter((r) => {
    const ts = r.finishedAt ?? r.startedAt;
    return new Date(ts).getTime() >= cutoff;
  });
  const path = jobsLedgerPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, kept.length === 0 ? "" : `${kept.map((r) => JSON.stringify(r)).join("\n")}\n`);
  return all.length - kept.length;
}
