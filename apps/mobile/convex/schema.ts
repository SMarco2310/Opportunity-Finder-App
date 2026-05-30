// ===========================================================================
// Convex database schema — the single source of truth for every table, field,
// and index in the backend. Convex generates end-to-end TypeScript types from
// this file (run `npx convex dev`), so the mobile app and scraper payloads are
// type-checked against these definitions.
//
// Index naming convention: `by_<fields>`. Each index exists to back a specific
// query access pattern — the rationale is noted inline next to each one.
// ===========================================================================

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// ---------------------------------------------------------------------------
// Shared enums (kept as unions so Convex generates literal types end-to-end).
// ---------------------------------------------------------------------------

export const vCategory = v.union(
  v.literal('scholarships'), // Bourses
  v.literal('jobs'), // Emplois
  v.literal('fellowships'), // Fellowships
  v.literal('grants'), // Subventions
  v.literal('contests'), // Concours
  v.literal('training'), // Formations
  v.literal('events'), // Événements
  v.literal('volunteer'), // Bénévolat
);

export const vLanguage = v.union(v.literal('fr'), v.literal('en'));

export const vOpportunityStatus = v.union(
  v.literal('draft'),
  v.literal('published'),
  v.literal('archived'),
  v.literal('expired'),
);

export const vSourceStatus = v.union(
  v.literal('active'),
  v.literal('paused'),
  v.literal('error'),
);

export const vSaveStatus = v.union(
  v.literal('saved'),
  v.literal('applied'),
  v.literal('won'),
  v.literal('declined'),
);

export const vChannel = v.union(v.literal('whatsapp'), v.literal('push'));

export const vTriggerType = v.union(
  v.literal('deadline_reminder'),
  v.literal('new_match'),
  v.literal('digest'),
);

export const vPlatform = v.union(v.literal('android'), v.literal('ios'));

export const EMBEDDING_DIM = 1536; // OpenAI text-embedding-3-small

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    phone: v.string(),
    fullName: v.optional(v.string()),
    region: v.optional(v.string()),
    educationLevel: v.optional(v.string()),
    fieldOfStudy: v.optional(v.string()),
    language: vLanguage,
    notifPrefs: v.object({
      push: v.boolean(),
      whatsapp: v.boolean(),
    }),
    whatsappOptOut: v.boolean(),
    // Cached centroid of the user's saved-opportunity embeddings (Step 11).
    interestCentroid: v.optional(v.array(v.float64())),
    interestCentroidUpdatedAt: v.optional(v.number()),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  }).index('by_clerk_user_id', ['clerkUserId']),

  sources: defineTable({
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
    lastScrapedAt: v.optional(v.number()),
    trustScore: v.number(), // 0..1
    status: vSourceStatus,
    totalOpportunities: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_url', ['url']),

  opportunities: defineTable({
    sourceId: v.id('sources'),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    category: vCategory,
    deadlineAt: v.number(),
    geographicScope: v.string(), // e.g. "Togo", "Afrique", "International"
    fundingLevel: v.union(
      v.literal('fully_funded'),
      v.literal('partial'),
      v.literal('unfunded'),
      v.literal('unknown'),
    ),
    educationLevelMin: v.optional(v.string()),
    fieldTags: v.array(v.string()),
    language: vLanguage,
    format: v.optional(v.string()), // "online" | "in_person" | "hybrid"
    duration: v.optional(v.string()),
    ageMin: v.optional(v.number()),
    ageMax: v.optional(v.number()),
    sourceUrl: v.string(),
    mirrorUrls: v.array(v.string()),
    embedding: v.array(v.float64()),
    verified: v.boolean(),
    status: vOpportunityStatus,
    scrapedAt: v.number(),
    publishedAt: v.optional(v.number()),
  })
    // Home feed "closing this week": filter published + range-scan by deadline.
    .index('by_deadline_status', ['status', 'deadlineAt'])
    // Category-filtered browsing ordered by soonest deadline.
    .index('by_category_deadline', ['category', 'deadlineAt'])
    // Stable public URLs / dedupe-by-slug lookups.
    .index('by_slug', ['slug'])
    // Full-text search on the title for the Explore tab (Step 6).
    .searchIndex('search_title', {
      searchField: 'title',
      filterFields: ['category', 'language', 'status'],
    })
    // Semantic dedupe (scraper) + personalization (Step 11). 1536-dim to match
    // OpenAI text-embedding-3-small. Convex vector filters only support eq/or on
    // a single field, so cross-field AND (e.g. category AND status) is done in
    // code after the search — see opportunities.findSimilar.
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: EMBEDDING_DIM,
      filterFields: ['category', 'language', 'status'],
    }),

  userInterests: defineTable({
    userId: v.id('users'),
    category: vCategory,
    fieldTag: v.optional(v.string()),
    weight: v.number(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  userSaves: defineTable({
    userId: v.id('users'),
    opportunityId: v.id('opportunities'),
    status: vSaveStatus,
    userNotes: v.optional(v.string()),
    // Denormalized from the opportunity so reminders can scan by deadline
    // without a join.
    deadlineAt: v.number(),
    savedAt: v.number(),
    appliedAt: v.optional(v.number()),
  })
    // The Saved tab's two sub-lists (Marqués / Postulés).
    .index('by_user_status', ['userId', 'status'])
    // Toggle/lookup a single user's save for an opportunity (idempotent saves).
    .index('by_user_opportunity', ['userId', 'opportunityId'])
    // Reminder cron scans all saves still 'saved' whose deadline is ~3 days out.
    // `deadlineAt` is denormalized onto the save so this needs no join.
    .index('by_deadline_for_reminders', ['status', 'deadlineAt']),

  notifications: defineTable({
    userId: v.id('users'),
    opportunityId: v.id('opportunities'),
    channel: vChannel,
    triggerType: vTriggerType,
    sentAt: v.number(),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
  }).index('by_user_opportunity_trigger', [
    'userId',
    'opportunityId',
    'triggerType',
  ]),

  pushTokens: defineTable({
    userId: v.id('users'),
    expoPushToken: v.string(),
    deviceId: v.string(),
    platform: vPlatform,
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_device', ['userId', 'deviceId']),
});
