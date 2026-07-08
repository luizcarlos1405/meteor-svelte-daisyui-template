interface MeteorLikeError {
  reason?: string;
  message?: string;
  error?: string | number;
}

// Maps accounts-passwordless / accounts errors to friendly messages.
const MESSAGES: Record<string, string> = {
  'User not found': 'User not found.',
  'Invalid email': 'Invalid email.',
  'Need to set a username or email': 'Please enter an email.',
  // accounts-passwordless verify-phase errors
  'Invalid login token': 'Invalid code.',
  'Login token expired': 'That code has expired. Request a new one.',
  'No matching login token': 'Invalid or already-used code.',
  'Username already exists.': 'That name is already taken.',
};

export function authErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Something went wrong. Please try again.';
  const e = err as MeteorLikeError;
  const key = e.reason ?? e.message ?? '';
  return MESSAGES[key] ?? key ?? 'Something went wrong. Please try again.';
}
