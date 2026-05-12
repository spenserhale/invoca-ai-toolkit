#!/usr/bin/env bun
import { allSpecs } from "../src/commandSpecs.js";
import { baseSpecs } from "../src/commandSpecs.js";
import { registerRingPoolSpecs } from "../src/commands/ringpool/index.js";
import { registerBulkRingPoolSpecs } from "../src/commands/bulk-ringpool/index.js";
import { registerSignalSpecs } from "../src/commands/signal/index.js";
import { registerTransactionsSpecs } from "../src/commands/transactions/index.js";

registerRingPoolSpecs();
registerBulkRingPoolSpecs();
registerSignalSpecs();
registerTransactionsSpecs();

const CANONICAL_VERBS = new Set([
  "agent-context",
  "feedback",
  "save",
  "list",
  "show",
  "delete",
  "get",
  "prune",
  "allocate",
  "apply",
  "update",
  "create",
  "download",
]);

const BANNED_FLAGS = new Set([
  "-y",
  "--yes",
  "--skip-confirmations",
  "--format",
  "--output",
  "--no-confirm",
]);

const REQUIRED_FORMAT_FLAGS = ["--toon", "--json", "--csv"] as const;
const REQUIRED_MUTATION_FLAGS = ["--force"] as const;

const errors: string[] = [];

function lintPath(path: readonly string[]): void {
  if (path.length === 0) {
    errors.push("(empty command path)");
    return;
  }
  const tail = path[path.length - 1]!;
  if (!CANONICAL_VERBS.has(tail)) {
    errors.push(
      `${path.join(" ")}: terminal segment "${tail}" is not a canonical verb (allowed: ${[...CANONICAL_VERBS].sort().join(", ")})`,
    );
  }
}

function lintFlags(path: readonly string[], flagNames: string[]): void {
  for (const banned of BANNED_FLAGS) {
    if (flagNames.includes(banned)) {
      errors.push(`${path.join(" ")}: uses banned flag "${banned}"`);
    }
  }
}

const dataReturningPathSet = new Set<string>();

for (const spec of allSpecs()) {
  lintPath(spec.path);
  const flagNames = (spec.flags ?? []).map((f) => f.name);
  lintFlags(spec.path, flagNames);

  const isData = spec.flags?.some((f) => REQUIRED_FORMAT_FLAGS.includes(f.name as "--toon"));
  if (isData) {
    dataReturningPathSet.add(spec.path.join(" "));
    for (const required of REQUIRED_FORMAT_FLAGS) {
      if (!flagNames.includes(required)) {
        errors.push(`${spec.path.join(" ")}: missing required format flag "${required}"`);
      }
    }
  }

  if (spec.mutates) {
    for (const required of REQUIRED_MUTATION_FLAGS) {
      if (!flagNames.includes(required) && !spec.path.includes("signal")) {
        errors.push(`${spec.path.join(" ")}: marked mutates but missing "${required}"`);
      }
    }
    if (!flagNames.includes("--dry-run")) {
      errors.push(`${spec.path.join(" ")}: marked mutates but missing "--dry-run"`);
    }
  }
}

if (baseSpecs.length === 0) {
  errors.push("commandSpecs.baseSpecs is empty — registry was not initialized");
}

if (errors.length > 0) {
  console.error(`vocab-lint: ${errors.length} issue(s) found:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`vocab-lint: ${allSpecs().length} commands checked, no issues`);
