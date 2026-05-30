// Alerts (reminder history) data layer, mock-backed. Real data comes from the
// notifications table (Step 11) — a query over the user's sent reminders.

import type { Category } from './categories';

export type AlertChannel = 'whatsapp' | 'push';

export type Alert = {
  _id: string;
  opportunityId: string;
  title: string;
  category: Category;
  channel: AlertChannel;
  daysLeft: number;
  sentLabel: string;
  read: boolean;
};

export function useAlerts(): { items: Alert[]; isLoading: boolean } {
  const items: Alert[] = [
    { _id: 'a1', opportunityId: 'm1', title: 'Bourse Eiffel Excellence 2026', category: 'scholarships', channel: 'whatsapp', daysLeft: 3, sentLabel: 'il y a 2 h', read: false },
    { _id: 'a2', opportunityId: 's4', title: 'Mandela Washington Fellowship 2026', category: 'fellowships', channel: 'push', daysLeft: 3, sentLabel: 'hier', read: true },
    { _id: 'a3', opportunityId: 's3', title: 'Business Analyst — Junior', category: 'jobs', channel: 'whatsapp', daysLeft: 3, sentLabel: 'il y a 3 j', read: true },
  ];
  return { items, isLoading: false };
}
