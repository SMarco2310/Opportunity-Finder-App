// User interests: the category/field picker shown after the first save (Step 11).
// `set` replaces the whole interest set (clear-then-insert) so the picker is the
// single source of truth. These feed the personalized home feed ranking.

import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { vCategory } from './schema';
import { requireUser } from './users';

// Replace the current user's category interests (one-screen picker, Step 11).
export const set = mutation({
  args: {
    categories: v.array(vCategory),
    fieldTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // Clear existing interests, then re-insert.
    const existing = await ctx.db
      .query('userInterests')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
    for (const row of existing) await ctx.db.delete(row._id);

    const now = Date.now();
    for (const category of args.categories) {
      await ctx.db.insert('userInterests', {
        userId: user._id,
        category,
        weight: 1,
        createdAt: now,
      });
    }
    for (const fieldTag of args.fieldTags ?? []) {
      await ctx.db.insert('userInterests', {
        userId: user._id,
        category: args.categories[0] ?? 'scholarships',
        fieldTag,
        weight: 0.5,
        createdAt: now,
      });
    }
    return { count: args.categories.length };
  },
});

// Current user's interests.
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique();
    if (!user) return [];
    return ctx.db
      .query('userInterests')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
  },
});
