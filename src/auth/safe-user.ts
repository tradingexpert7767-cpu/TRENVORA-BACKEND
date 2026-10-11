import type { Profile, User } from '@prisma/client';

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  subscriptionTier: string;
  tradingExperience: string;
  riskPreference: string;
  joinedAt: string;
};

export function toSafeUser(user: User, profile: Profile | null): SafeUser {
  return {
    id: user.id,
    name: user.name ?? user.email.split('@')[0],
    email: user.email,
    subscriptionTier: profile?.subscriptionTier ?? 'FREE',
    tradingExperience: profile?.tradingExperience ?? 'Beginner',
    riskPreference: profile?.riskPreference ?? 'MODERATE',
    joinedAt: user.createdAt.toISOString(),
  };
}
