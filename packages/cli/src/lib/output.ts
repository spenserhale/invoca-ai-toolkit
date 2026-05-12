import { InvocaError } from "@invoca-toolkit/sdk";

export const OUTPUT_FORMATS = ["toon", "json", "csv"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export interface FormatFlags {
  readonly toon?: boolean;
  readonly json?: boolean;
  readonly csv?: boolean;
}

export function resolveFormat(flags: FormatFlags): OutputFormat {
  const picked = OUTPUT_FORMATS.filter((f) => flags[f]);
  if (picked.length > 1) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: `Only one output format flag may be set (got: ${picked
        .map((f) => `--${f}`)
        .join(", ")})`,
      validValues: OUTPUT_FORMATS.map((f) => `--${f}`),
    });
  }
  return picked[0] ?? "toon";
}

export function renderOutput(data: unknown, format: OutputFormat): string {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);
    case "csv":
      return renderCsv(data);
    case "toon":
      return renderToon(data, 0);
  }
}

function renderCsv(data: unknown): string {
  if (!Array.isArray(data)) {
    throw new InvocaError({
      code: "E_VALIDATION",
      message: "CSV output requires an array of flat objects",
      hint: "Use --json or --toon for nested or non-array data",
    });
  }
  if (data.length === 0) return "";
  const rows = data as Array<Record<string, unknown>>;
  const columnSet = new Set<string>();
  for (const row of rows) {
    if (row == null || typeof row !== "object" || Array.isArray(row)) {
      throw new InvocaError({
        code: "E_VALIDATION",
        message: "CSV output requires each row to be a flat object",
      });
    }
    for (const k of Object.keys(row)) columnSet.add(k);
  }
  const columns = [...columnSet];
  for (const row of rows) {
    for (const col of columns) {
      const v = row[col];
      if (v !== undefined && v !== null && typeof v === "object") {
        throw new InvocaError({
          code: "E_VALIDATION",
          message: `CSV cell at column "${col}" contains a nested object`,
          hint: "Flatten the data, or use --json/--toon",
        });
      }
    }
  }
  const escape = (v: unknown): string => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(row[c])).join(","));
  }
  return lines.join("\n");
}

function renderToon(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "null";
  if (value === undefined) return "";
  if (typeof value === "string") return value.includes("\n") ? JSON.stringify(value) : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const lines: string[] = [];
    for (const item of value) {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        lines.push(`${pad}-`);
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          lines.push(`${pad}  ${k}: ${renderInlineOrBlock(v, indent + 2)}`);
        }
      } else {
        lines.push(`${pad}- ${renderInlineOrBlock(item, indent + 1)}`);
      }
    }
    return lines.join("\n");
  }
  if (typeof value === "object") {
    const lines: string[] = [];
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      lines.push(`${pad}${k}: ${renderInlineOrBlock(v, indent + 1)}`);
    }
    return lines.join("\n");
  }
  return String(value);
}

function renderInlineOrBlock(value: unknown, indent: number): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return renderToon(value, indent);
  if (Array.isArray(value) && value.length === 0) return "[]";
  if (!Array.isArray(value) && Object.keys(value as object).length === 0) return "{}";
  return `\n${renderToon(value, indent)}`;
}
