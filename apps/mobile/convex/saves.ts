// User saves: the bookmark + application tracker. Mutations require auth
// (requireUser throws when signed out — that's what triggers the OTP gate on
// the client). `deadlineAt` is copied from the opportunity at save time so the
// reminder cron can scan saves by deadline without a join.

import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { vSaveStatus } from './schema';
import { requireUser } from './users';

// Save an opportunity for the current user (idempotent).
export const add = mutation({
  args: { opportunityId: v.id('opportunities') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const opp = await ctx.db.get(args.opportunityId);
    if (!opp) throw new Error('Opportunité introuvable');

    const existing = await ctx.db
      .query('userSaves')
      .withIndex('by_user_opportunity', (q) =>
        q.eq('userId', user._id).eq('opportunityId', args.opportunityId),
      )
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert('userSaves', {
      userId: user._id,
      opportunityId: args.opportunityId,
      status: 'saved',
      deadlineAt: opp.deadlineAt,
      savedAt: Date.now(),
    });
  },
});

// Remove a save.
export const remove = mutation({
  args: { opportunityId: v.id('opportunities') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query('userSaves')
      .withIndex('by_user_opportunity', (q) =>
        q.eq('userId', user._id).eq('opportunityId', args.opportunityId),
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

// Mark a saved opportunity as applied.
export const markApplied = mutation({
  args: { opportunityId: v.id('opportunities') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query('userSaves')
      .withIndex('by_user_opportunity', (q) =>
        q.eq('userId', user._id).eq('opportunityId', args.opportunityId),
      )
      .unique();
    if (!existing) throw new Error('Sauvegarde introuvable');
    await ctx.db.patch(existing._id, { status: 'applied', appliedAt: Date.now() });
  },
});

// Current user's saves (optionally by status) with opportunity data joined.
export const listMine = query({
  args: { status: v.optional(vSaveStatus) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique();
    if (!user) return [];

    const saves = args.status
      ? await ctx.db
          .query('userSaves')
          .withIndex('by_user_status', (q) =>
            q.eq('userId', user._id).eq('status', args.status!),
          )
          .collect()
      : await ctx.db
          .query('userSaves')
          .withIndex('by_user_status', (q) => q.eq('userId', user._id))
          .collect();

    const withOpportunity = await Promise.all(
      saves.map(async (s) => {
        const opp = await ctx.db.get(s.opportunityId);
        const source = opp ? await ctx.db.get(opp.sourceId) : null;
        return { ...s, opportunity: opp, sourceName: source?.name ?? null };
      }),
    );
    return withOpportunity
      .filter((s) => s.opportunity !== null)
      .sort((a, b) => a.deadlineAt - b.deadlineAt);
  },
});

// Has the current user saved this opportunity? (drives bookmark state)
export const isSaved = query({
  args: { opportunityId: v.id('opportunities') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique();
    if (!user) return false;
    const existing = await ctx.db
      .query('userSaves')
      .withIndex('by_user_opportunity', (q) =>
        q.eq('userId', user._id).eq('opportunityId', args.opportunityId),
      )
      .unique();
    return existing !== null;
  },
});
