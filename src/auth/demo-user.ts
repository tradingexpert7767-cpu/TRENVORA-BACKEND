// Hardcoded demo account — there is no user table / Postgres wired up yet.
// Replace with a real Users table + hashed passwords once the database is
// connected (tracked as a Phase 2 item, not a design decision).
export const DEMO_USER = {
  id: 'demo-user-001',
  name: 'Aditi Sharma',
  email: 'demo@trenvora.com',
  password: 'demo1234',
  subscriptionTier: 'FREE' as const,
  tradingExperience: 'Intermediate',
  riskPreference: 'MODERATE' as const,
  joinedAt: '2026-01-14T00:00:00.000Z',
};

export type SafeUser = Omit<typeof DEMO_USER, 'password'>;

export function toSafeUser(): SafeUser {
  const { password: _password, ...safe } = DEMO_USER;
  return safe;
}
