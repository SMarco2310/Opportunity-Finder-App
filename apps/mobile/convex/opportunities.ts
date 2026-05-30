// Opportunities: the core content table.
//   • Write side (internal, scraper/seed): insert, bulkInsert, addMirrorUrl, and
//     findSimilar (vector dedupe). All take the admin key, never a client.
//   • Read side (public, mobile app): homeFeed, getById, search.
// Each opportunity carries a 1536-dim embedding used for dedupe + personalization.

import { v } from 'convex/values';

import {
  internalAction,
  internalMutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from './_generated/server';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { vCategory } from './schema';
import { opportunityInput } from './validators';

const DAY_MS = 24 * 60 * 60 * 1000;

type OpportunityInput = typeof opportunityInput.type;

// Shared insert: resolves sourceUrl -> sourceId and writes one published row.
async function insertOne(
  ctx: MutationCtx,
  input: OpportunityInput,
): Promise<Id<'opportunities'>> {
  const source = await ctx.db
    .query('sources')
    .withIndex('by_url', (q) => q.eq('url', input.sourceUrl))
    .unique();
  if (!source) {
    throw new Error(`Source inconnue pour l'URL: ${input.sourceUrl}`);
  }
  const now = Date.now();
  const id = await ctx.db.insert('opportunities', {
    sourceId: source._id,
    title: input.title,
    slug: input.slug,
    description: input.description,
    category: input.category,
    deadlineAt: input.deadlineAt,
    geographicScope: input.geographicScope,
    fundingLevel: input.fundingLevel,
    educationLevelMin: input.educationLevelMin,
    fieldTags: input.fieldTags,
    language: input.language,
    format: input.format,
    duration: input.duration,
    ageMin: input.ageMin,
    ageMax: input.ageMax,
    sourceUrl: input.applyUrl,
    mirrorUrls: input.mirrorUrls ?? [],
    embedding: input.embedding,
    verified: input.verified ?? false,
    status: input.status ?? 'published',
    scrapedAt: now,
    publishedAt: now,
  });
  return id;
}

// Insert a single opportunity (scraper path).
export const insert = internalMutation({
  args: { opportunity: opportunityInput },
  handler: async (ctx, args) => insertOne(ctx, args.opportunity),
});

// Bulk insert (seed path).
export const bulkInsert = internalMutation({
  args: { opportunities: v.array(opportunityInput) },
  handler: async (ctx, args) => {
    const ids: Id<'opportunities'>[] = [];
    for (const opp of args.opportunities) {
      ids.push(await insertOne(ctx, opp));
    }
    return { inserted: ids.length };
  },
});

// Append a mirror URL to an existing opportunity (dedupe merge path).
export const addMirrorUrl = internalMutation({
  args: { opportunityId: v.id('opportunities'), url: v.string() },
  handler: async (ctx, args) => {
    const opp = await ctx.db.get(args.opportunityId);
    if (!opp) throw new Error('Opportunité introuvable');
    if (opp.sourceUrl === args.url || opp.mirrorUrls.includes(args.url)) return;
    await ctx.db.patch(args.opportunityId, {
      mirrorUrls: [...opp.mirrorUrls, args.url],
    });
  },
});

// Vector-search the N closest published opportunities in a category.
// Runs in an action (ctx.vectorSearch is action-only); status is filtered
// after fetch because Convex vector filters can't AND across fields.
export const findSimilar = internalAction({
  args: {
    embedding: v.array(v.float64()),
    category: vCategory,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch('opportunities', 'by_embedding', {
      vector: args.embedding,
      limit: args.limit ?? 3,
      filter: (q) => q.eq('category', args.category),
    });
    const matches: { id: Id<'opportunities'>; score: number; sourceUrl: string }[] = [];
    for (const r of results) {
      const doc = await ctx.runQuery(internal.opportunities.getInternal, {
        id: r._id,
      });
      if (doc && doc.status === 'published') {
        matches.push({ id: r._id, score: r._score, sourceUrl: doc.sourceUrl });
      }
    }
    return matches;
  },
});

// Internal fetch helper used by findSimilar.
export const getInternal = query({
  args: { id: v.id('opportunities') },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// ---------------------------------------------------------------------------
// Read queries (consumed by the mobile app)
// ---------------------------------------------------------------------------

async function withSourceName(ctx: QueryCtx, opp: Doc<'opportunities'>) {
  const source = await ctx.db.get(opp.sourceId);
  return {
    ...opp,
    sourceName: source?.name ?? 'Source',
    sourceTrustScore: source?.trustScore ?? 0,
    sourceVerified: (source?.trustScore ?? 0) >= 0.7,
  };
}

// Home feed: closingThisWeek (≤7d, asc, 5) + forYou (trust/recency, 20).
// Personalized ranking for authed users is added in Step 11.
export const homeFeed = query({
  args: { category: v.optional(vCategory) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const weekEnd = now + 7 * DAY_MS;

    const closingRaw = await ctx.db
      .query('opportunities')
      .withIndex('by_deadline_status', (q) =>
        q.eq('status', 'published').gte('deadlineAt', now).lte('deadlineAt', weekEnd),
      )
      .order('asc')
      .take(args.category ? 50 : 5);

    const closingFiltered = args.category
      ? closingRaw.filter((o) => o.category === args.category).slice(0, 5)
      : closingRaw;

    // Candidate pool: upcoming published opportunities.
    const poolRaw = await ctx.db
      .query('opportunities')
      .withIndex('by_deadline_status', (q) =>
        q.eq('status', 'published').gte('deadlineAt', now),
      )
      .order('asc')
      .take(120);

    const pool = args.category
      ? poolRaw.filter((o) => o.category === args.category)
      : poolRaw;

    // Anonymous ranking = trust-and-recency: trustworthy sources rank high,
    // minus a penalty for how far away the deadline is (sooner = more urgent).
    // Step 11 swaps in a personalized score for authenticated users.
    const scored = await Promise.all(
      pool.map(async (o) => {
        const withSrc = await withSourceName(ctx, o);
        const daysLeft = Math.max(0, (o.deadlineAt - now) / DAY_MS);
        const score = withSrc.sourceTrustScore * 100 - daysLeft;
        return { ...withSrc, _score: score };
      }),
    );
    scored.sort((a, b) => b._score - a._score);

    const closingThisWeek = await Promise.all(
      closingFiltered.map((o) => withSourceName(ctx, o)),
    );

    return {
      closingThisWeek,
      forYou: scored.slice(0, 20),
    };
  },
});

// Full opportunity for the detail screen (with source name + verified flag).
export const getById = query({
  args: { id: v.id('opportunities') },
  handler: async (ctx, args) => {
    const opp = await ctx.db.get(args.id);
    if (!opp) return null;
    return withSourceName(ctx, opp);
  },
});

// Full-text search on title + structured filters (Explore tab).
export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    category: v.optional(vCategory),
    geographicScope: v.optional(v.string()),
    fundingLevel: v.optional(v.string()),
    educationLevel: v.optional(v.string()),
    deadlineBefore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const term = args.searchTerm?.trim();
    let results: Doc<'opportunities'>[];

    if (term) {
      results = await ctx.db
        .query('opportunities')
        .withSearchIndex('search_title', (q) => {
          let search = q.search('title', term).eq('status', 'published');
          if (args.category) search = search.eq('category', args.category);
          return search;
        })
        .take(50);
    } else if (args.category) {
      results = await ctx.db
        .query('opportunities')
        .withIndex('by_category_deadline', (q) => q.eq('category', args.category!))
        .order('asc')
        .take(50);
      results = results.filter((o) => o.status === 'published');
    } else {
      results = await ctx.db
        .query('opportunities')
        .withIndex('by_deadline_status', (q) => q.eq('status', 'published'))
        .order('asc')
        .take(50);
    }

    const filtered = results.filter((o) => {
      if (args.geographicScope && o.geographicScope !== args.geographicScope) return false;
      if (args.fundingLevel && o.fundingLevel !== args.fundingLevel) return false;
      if (args.educationLevel && o.educationLevelMin !== args.educationLevel) return false;
      if (args.deadlineBefore && o.deadlineAt > args.deadlineBefore) return false;
      return true;
    });

    return Promise.all(filtered.map((o) => withSourceName(ctx, o)));
  },
});
