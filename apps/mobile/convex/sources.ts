// Sources registry: the curated sites the scraper pulls from. Writes are
// `internal` (scraper/seed only, via admin key); the client may only read
// (adminStatus dashboard + public listActive). seedSources is idempotent so
// re-running the scraper never duplicates a source.

import { v } from 'convex/values';

import { internalMutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { sourceInput } from './validators';

// Bulk-insert sources idempotently (skip URLs that already exist).
// Internal: callable from the seed script / scraper with the admin key only.
export const seedSources = internalMutation({
  args: { sources: v.array(sourceInput) },
  handler: async (ctx, args) => {
    let inserted = 0;
    let skipped = 0;
    for (const s of args.sources) {
      const existing = await ctx.db
        .query('sources')
        .withIndex('by_url', (q) => q.eq('url', s.url))
        .unique();
      if (existing) {
        skipped++;
        continue;
      }
      await ctx.db.insert('sources', {
        ...s,
        status: 'active',
        totalOpportunities: 0,
      });
      inserted++;
    }
    return { inserted, skipped };
  },
});

// Record the result of a scrape run on a source.
export const markScraped = internalMutation({
  args: {
    sourceId: v.id('sources'),
    opportunitiesProcessed: v.number(),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error(`Source introuvable: ${args.sourceId}`);
    await ctx.db.patch(args.sourceId, {
      lastScrapedAt: Date.now(),
      totalOpportunities: source.totalOpportunities + args.opportunitiesProcessed,
    });
  },
});

// Look up a source id by its canonical URL (used by the scraper).
export const getIdByUrl = internalMutation({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<Id<'sources'> | null> => {
    const source = await ctx.db
      .query('sources')
      .withIndex('by_url', (q) => q.eq('url', args.url))
      .unique();
    return source?._id ?? null;
  },
});

// Admin dashboard: per-source status. Real-time via useQuery on the client.
export const adminStatus = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query('sources').collect();
    return sources
      .map((s) => ({
        _id: s._id,
        name: s.name,
        url: s.url,
        status: s.status,
        lastScrapedAt: s.lastScrapedAt ?? null,
        totalOpportunities: s.totalOpportunities,
        trustScore: s.trustScore,
      }))
      .sort((a, b) => (b.lastScrapedAt ?? 0) - (a.lastScrapedAt ?? 0));
  },
});

// Public list of active sources (e.g. for an "about our sources" view).
export const listActive = query({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query('sources')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect(),
});
