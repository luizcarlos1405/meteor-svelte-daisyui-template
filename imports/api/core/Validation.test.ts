import assert from 'assert';
import { z } from 'zod';
import { parseWith } from './Validation';

const Schema = z.object({ x: z.number().int().nonnegative() });

describe('Validation.parseWith', () => {
  it('returns ok with parsed data for valid input', () => {
    const r = parseWith(Schema, { x: 5 });
    assert.strictEqual(r.ok, true);
    if (r.ok) assert.strictEqual(r.value.x, 5);
  });

  it('returns an error result for invalid input', () => {
    const r = parseWith(Schema, { x: -1 });
    assert.strictEqual(r.ok, false);
    if (!r.ok) assert.ok(r.error instanceof z.ZodError);
  });

  it('returns an error result for malformed input', () => {
    const r = parseWith(Schema, 'nope');
    assert.strictEqual(r.ok, false);
  });
});
