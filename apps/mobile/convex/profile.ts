// Onboarding profile: a single atomic mutation that finishes the onboarding
// flow — upserts the user row, stores name/age, marks onboarding complete, and
// replaces the category interests. Keeping it in one mutation means a completed
// onboarding is all-or-nothing (no half-saved state if the app dies mid-flow).

import { v } from 'convex/values';

import { mutation } from './_generated/server';
import { vCategory } from './schema';

export const completeOnboarding = mutation({
  args: {
    fullName: v.string(),
    age: v.optional(v.number()),
    categories: v.array(vCategory),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Non authentifié');

    const now = Date.now();

    // Upsert the user row (mirrors users.ensureUser).
    let user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        fullName: args.fullName,
        age: args.age,
        onboardingCompletedAt: now,
        lastActiveAt: now,
      });
    } else {
      const userId = await ctx.db.insert('users', {
        clerkUserId: identity.subject,
        phone: identity.phoneNumber ?? '',
        fullName: args.fullName,
        age: args.age,
        onboardingCompletedAt: now,
        language: 'fr',
        notifPrefs: { push: true, whatsapp: true },
        whatsappOptOut: false,
        createdAt: now,
        lastActiveAt: now,
      });
      user = await ctx.db.get(userId);
    }
    if (!user) throw new Error('Utilisateur introuvable');

    // Replace category interests (clear-then-insert), same as interests.set.
    const existing = await ctx.db
      .query('userInterests')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    for (const category of args.categories) {
      await ctx.db.insert('userInterests', {
        userId: user._id,
        category,
        weight: 1,
        createdAt: now,
      });
    }

    return { userId: user._id, count: args.categories.length };
  },
});
