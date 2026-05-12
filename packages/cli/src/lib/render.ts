import { renderOutput, resolveFormat, type FormatFlags } from "./output.js";
import { deliver } from "./deliver.js";

export interface RenderFlags extends FormatFlags {
  readonly deliver?: string;
}

export async function emit(data: unknown, flags: RenderFlags): Promise<void> {
  const format = resolveFormat(flags);
  const payload = renderOutput(data, format);
  await deliver(payload, flags.deliver, format);
}
