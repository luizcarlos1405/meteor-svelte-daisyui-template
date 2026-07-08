// Shared Meteor.Error catalog. Every method throws `Meteor.Error(code, reason)`
// where `code` is an English identifier and `reason` is a user-facing message.
// Add one entry per domain error; keep identifiers in English.
import { Meteor } from 'meteor/meteor';

export const Errors = {
  notAuthorized: 'You are not authorized to perform this action.',
} as const;

export type ErrorCode = keyof typeof Errors;

// Throws a Meteor.Error. `message` overrides the catalog default when the
// surrounding context needs a more specific phrasing.
export function meteorError(code: ErrorCode, message?: string): never {
  throw new Meteor.Error(code, message ?? Errors[code]);
}
