// Pure validation helper. SPEC §7.
import { ZodError, type ZodType } from 'zod';

export type Result<T> = { ok: true; value: T } | { ok: false; error: ZodError };

// Validates input against a Zod schema, returning a Result instead of throwing.
export function parseWith<T>(schema: ZodType<T>, input: unknown): Result<T> {
  const parsed = schema.safeParse(input);
  if (parsed.success) {
    return { ok: true, value: parsed.data };
  }
  return { ok: false, error: parsed.error };
}
