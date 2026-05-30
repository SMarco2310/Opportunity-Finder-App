import { httpRouter } from 'convex/server';

import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();

// Twilio inbound webhook (WhatsApp). Handles the STOP keyword to opt out.
http.route({
  path: '/twilio/whatsapp',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const form = await request.formData();
    const from = String(form.get('From') ?? '');
    const body = String(form.get('Body') ?? '').trim().toUpperCase();

    if (body === 'STOP' && from) {
      await ctx.runMutation(internal.notifications.optOutByPhone, { phone: from });
    }

    // Respond with empty TwiML so Twilio doesn't auto-reply.
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }),
});

export default http;
