// Users: maps a Clerk identity (phone-OTP) to a Convex `users` row. The Clerk
// JWT `subject` is the stable key; we look users up by `clerkUserId`. All
// auth-gated logic elsewhere reuses requireUser()/getCurrentUser() from here so
// permission checks live on the server (never in the client).

import { v } from 'convex/values';

import { mutation, query, type QueryCtx } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import { vLanguage } from './schema';

// Resolve the Convex user row for the authenticated Clerk identity, or null.
export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query('users')
    .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
    .unique();
}

// Throws when unauthenticated — use inside mutations that require a user.
export async function requireUser(ctx: QueryCtx): Promise<Doc<'users'>> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error('Non authentifié');
  return user;
}

// Upsert a user row keyed by Clerk user id. Called on every app start.
export const ensureUser = mutation({
  args: {
    phone: v.optional(v.string()),
    fullName: v.optional(v.string()),
    language: v.optional(vLanguage),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Non authentifié');

    const now = Date.now();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastActiveAt: now,
        ...(args.fullName ? { fullName: args.fullName } : {}),
        ...(args.phone ? { phone: args.phone } : {}),
      });
      return existing._id;
    }

    const phone = args.phone ?? identity.phoneNumber ?? '';
    return await ctx.db.insert('users', {
      clerkUserId: identity.subject,
      phone,
      fullName: args.fullName ?? identity.name,
      language: args.language ?? 'fr',
      notifPrefs: { push: true, whatsapp: true },
      whatsappOptOut: false,
      createdAt: now,
      lastActiveAt: now,
    });
  },
});

// Current user's profile (null when signed out).
export const me = query({
  args: {},
  handler: async (ctx) => getCurrentUser(ctx),
});
