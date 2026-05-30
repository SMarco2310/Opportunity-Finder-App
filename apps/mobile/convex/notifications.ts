// Notifications: the sent-reminder log + the queries that drive reminder
// dispatch. The log doubles as the de-dupe ledger — dueReminders() skips any
// (user, opportunity) that already has a 'deadline_reminder' row, so the daily
// cron is safe to re-run. All functions here are internal (cron/action only).

import { v } from 'convex/values';

import { internalMutation, internalQuery } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { vChannel, vTriggerType } from './schema';

const DAY_MS = 24 * 60 * 60 * 1000;

export type DueReminder = {
  userId: Id<'users'>;
  opportunityId: Id<'opportunities'>;
  phone: string;
  whatsappOptOut: boolean;
  pushTokens: string[];
  title: string;
  category: string;
  sourceName: string;
  sourceUrl: string;
  deadlineAt: number;
  daysLeft: number;
};

// Saves whose deadline falls in [now+2d, now+3d], still 'saved', with no
// deadline_reminder already logged. Used by reminders.sendDeadlineReminders.
export const dueReminders = internalQuery({
  args: {},
  handler: async (ctx): Promise<DueReminder[]> => {
    const now = Date.now();
    const windowStart = now + 2 * DAY_MS;
    const windowEnd = now + 3 * DAY_MS;

    const saves = await ctx.db
      .query('userSaves')
      .withIndex('by_deadline_for_reminders', (q) =>
        q.eq('status', 'saved').gte('deadlineAt', windowStart).lte('deadlineAt', windowEnd),
      )
      .collect();

    const due: DueReminder[] = [];
    for (const save of saves) {
      // Skip if a reminder was already sent for this user+opportunity.
      const already = await ctx.db
        .query('notifications')
        .withIndex('by_user_opportunity_trigger', (q) =>
          q
            .eq('userId', save.userId)
            .eq('opportunityId', save.opportunityId)
            .eq('triggerType', 'deadline_reminder'),
        )
        .first();
      if (already) continue;

      const user = await ctx.db.get(save.userId);
      const opp = await ctx.db.get(save.opportunityId);
      if (!user || !opp) continue;

      const source = await ctx.db.get(opp.sourceId);
      const tokens = await ctx.db
        .query('pushTokens')
        .withIndex('by_user', (q) => q.eq('userId', save.userId))
        .collect();

      due.push({
        userId: save.userId,
        opportunityId: save.opportunityId,
        phone: user.phone,
        whatsappOptOut: user.whatsappOptOut,
        pushTokens: tokens.map((t) => t.expoPushToken),
        title: opp.title,
        category: opp.category,
        sourceName: source?.name ?? 'Source',
        sourceUrl: opp.sourceUrl,
        deadlineAt: opp.deadlineAt,
        daysLeft: Math.max(0, Math.round((opp.deadlineAt - now) / DAY_MS)),
      });
    }
    return due;
  },
});

// Record a sent notification (one row per channel).
export const log = internalMutation({
  args: {
    userId: v.id('users'),
    opportunityId: v.id('opportunities'),
    channel: vChannel,
    triggerType: vTriggerType,
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('notifications', {
      userId: args.userId,
      opportunityId: args.opportunityId,
      channel: args.channel,
      triggerType: args.triggerType,
      sentAt: Date.now(),
    });
  },
});

// WhatsApp STOP handler: opt a phone number out of WhatsApp reminders.
export const optOutByPhone = internalMutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.phone.replace(/^whatsapp:/, '').trim();
    const users = await ctx.db.query('users').collect();
    const match = users.find((u) => u.phone === normalized);
    if (match) await ctx.db.patch(match._id, { whatsappOptOut: true });
  },
});
