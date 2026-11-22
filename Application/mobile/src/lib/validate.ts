export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export type CredentialErrors = Partial<Record<'email' | 'password' | 'name', string>>;

/** Returns i18n keys (not messages) for each invalid field. */
export function validateCredentials(v: { email: string; password: string; name?: string }, opts: { requireName?: boolean } = {}): CredentialErrors {
  const errors: CredentialErrors = {};
  if (opts.requireName && !(v.name ?? '').trim()) errors.name = 'auth.errRequired';
  if (!isEmail(v.email)) errors.email = 'auth.errInvalidEmail';
  if (v.password.length < 6) errors.password = 'auth.errShortPassword';
  return errors;
}
