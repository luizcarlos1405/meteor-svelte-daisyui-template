import { z } from 'zod';

// Minimal, published projection of a Meteor user. SPEC §5.4
export const UserProfileSchema = z.object({
  _id: z.string(),
  email: z.email(),
  displayName: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
