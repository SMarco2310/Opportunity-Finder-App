// Deadline reminders (Step 11). An internal action — actions can do network I/O
// (Twilio + Expo Push), unlike queries/mutations. The cron in crons.ts invokes
// sendDeadlineReminders daily. Flow: read due saves (notifications.dueReminders)
// → for each, send WhatsApp + push → log one notifications row per channel so a
// re-run never double-sends.

import { internalAction } from './_generated/server';
import { internal } from './_generated/api';
import type { DueReminder } from './notifications';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

function whatsappBody(r: DueReminder): string {
  return (
    `*Rappel — ${r.title}*\n\n` +
    `⏰ Cette opportunité ferme dans ${r.daysLeft} jours.\n\n` +
    `📋 ${r.category} · ${r.sourceName}\n\n` +
    `👉 Postuler : ${r.sourceUrl}`
  );
}

async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. whatsapp:+14155238886
  if (!sid || !token || !from) {
    console.error('Twilio env manquant — WhatsApp non envoyé');
    return false;
  }
  const params = new URLSearchParams({
    To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
    From: from,
    Body: body,
  });
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    },
  );
  if (!res.ok) {
    console.error('Twilio erreur', res.status, await res.text());
    return false;
  }
  return true;
}

async function sendPush(tokens: string[], r: DueReminder): Promise<boolean> {
  if (tokens.length === 0) return false;
  const messages = tokens.map((to) => ({
    to,
    title: `⏰ ${r.title}`,
    body: `Ferme dans ${r.daysLeft} jours · Tape pour postuler`,
    data: { opportunityId: r.opportunityId },
    sound: 'default',
  }));
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) {
    console.error('Expo push erreur', res.status, await res.text());
    return false;
  }
  return true;
}

// Daily: send WhatsApp + push for saved opportunities ~3 days from deadline.
// Idempotent — notifications table prevents duplicates (checked in dueReminders).
export const sendDeadlineReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const due = await ctx.runQuery(internal.notifications.dueReminders, {});
    let whatsappSent = 0;
    let pushSent = 0;

    for (const r of due) {
      if (!r.whatsappOptOut && r.phone) {
        const ok = await sendWhatsApp(r.phone, whatsappBody(r));
        if (ok) {
          whatsappSent++;
          await ctx.runMutation(internal.notifications.log, {
            userId: r.userId,
            opportunityId: r.opportunityId,
            channel: 'whatsapp',
            triggerType: 'deadline_reminder',
          });
        }
      }

      const pushed = await sendPush(r.pushTokens, r);
      if (pushed) {
        pushSent++;
        await ctx.runMutation(internal.notifications.log, {
          userId: r.userId,
          opportunityId: r.opportunityId,
          channel: 'push',
          triggerType: 'deadline_reminder',
        });
      }
    }

    return { due: due.length, whatsappSent, pushSent };
  },
});
