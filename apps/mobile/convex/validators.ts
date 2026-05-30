// Input validators shared by the scraper/seed write path. These are deliberately
// separate from the table shape: the pipeline sends `sourceUrl` (the source's
// canonical listing URL) and `applyUrl`, and the server resolves `sourceUrl` to
// a `sources` document id before inserting. Keep this in sync with the Python
// `OpportunityRecord` model in scraper/src/models.py.

import { v } from 'convex/values';

import {
  vCategory,
  vLanguage,
  vOpportunityStatus,
} from './schema';

// Shape accepted from the scraper / seed pipeline for a single opportunity.
// `sourceUrl` identifies the source row; the server resolves it to a sourceId.
export const opportunityInput = v.object({
  sourceUrl: v.string(), // canonical source listing URL (maps to sources.url)
  title: v.string(),
  slug: v.string(),
  description: v.string(),
  category: vCategory,
  deadlineAt: v.number(),
  geographicScope: v.string(),
  fundingLevel: v.union(
    v.literal('fully_funded'),
    v.literal('partial'),
    v.literal('unfunded'),
    v.literal('unknown'),
  ),
  educationLevelMin: v.optional(v.string()),
  fieldTags: v.array(v.string()),
  language: vLanguage,
  format: v.optional(v.string()),
  duration: v.optional(v.string()),
  ageMin: v.optional(v.number()),
  ageMax: v.optional(v.number()),
  applyUrl: v.string(), // where "Postuler" should send the user
  mirrorUrls: v.optional(v.array(v.string())),
  embedding: v.array(v.float64()),
  verified: v.optional(v.boolean()),
  status: v.optional(vOpportunityStatus),
});

export const sourceInput = v.object({
  name: v.string(),
  url: v.string(),
  sourceType: v.union(
    v.literal('static'),
    v.literal('dynamic'),
    v.literal('api'),
    v.literal('aggregator'),
  ),
  country: v.string(),
  scrapeFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('manual'),
  ),
  trustScore: v.number(),
});
