// Expo push token registry. One row per (user, device); upserted on app start
// and after sign-in so a user can receive reminders on every device they use.
// The reminder action reads these tokens to send via the Expo Push API.

import { v } from 'convex/values';

import { mutation } from './_generated/server';
import { vPlatform } from './schema';
import { requireUser } from './users';

// Register / refresh the Expo push token for the current user + device.
export const register = mutation({
  args: {
    expoPushToken: v.string(),
    deviceId: v.string(),
    platform: vPlatform,
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_user_device', (q) =>
        q.eq('userId', user._id).eq('deviceId', args.deviceId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expoPushToken: args.expoPushToken,
        platform: args.platform,
      });
      return existing._id;
    }
    return await ctx.db.insert('pushTokens', {
      userId: user._id,
      expoPushToken: args.expoPushToken,
      deviceId: args.deviceId,
      platform: args.platform,
      createdAt: Date.now(),
    });
  },
});
