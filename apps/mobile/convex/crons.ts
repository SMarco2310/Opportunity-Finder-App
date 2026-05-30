import { cronJobs } from 'convex/server';

import { internal } from './_generated/api';

const crons = cronJobs();

// Deadline reminders run natively inside Convex (no GitHub Actions needed).
crons.daily(
  'deadline-reminders',
  { hourUTC: 8, minuteUTC: 0 },
  internal.reminders.sendDeadlineReminders,
);

export default crons;
