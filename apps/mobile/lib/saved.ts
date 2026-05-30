// Saved/applications data layer, mock-backed. The Saved tab is an application
// tracker: Actives (in progress), Brouillons (drafts), Expirées (past deadline),
// each with a completion %. Real data joins userSaves + opportunities (Step 7);
// the % completion field is a post-MVP extension of the saved record.

import { daysUntil } from './deadline';
import type { FeedOpportunity } from './feed';

export type SavedStatus = 'active' | 'draft' | 'expired';

export type SavedApplication = FeedOpportunity & {
  status: SavedStatus;
  progress: number; // 0..100
};

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const APPLICATIONS: SavedApplication[] = [
  { _id: 'm1', title: 'Bourse Eiffel Excellence 2026', category: 'scholarships', deadlineAt: now + 4 * DAY, geographicScope: 'France', fundingLevel: 'fully_funded', sourceName: 'Campus France', status: 'active', progress: 60 },
  { _id: 'mc', title: 'Mastercard Foundation Scholars', category: 'fellowships', deadlineAt: now + 6 * DAY, geographicScope: 'International', fundingLevel: 'fully_funded', sourceName: 'Univ. of California', status: 'active', progress: 25 },
  { _id: 's4', title: 'Mandela Washington Fellowship 2026', category: 'fellowships', deadlineAt: now + 21 * DAY, geographicScope: 'Afrique', fundingLevel: 'fully_funded', sourceName: 'U.S. Embassy', status: 'active', progress: 10 },
  { _id: 's7', title: 'Formation en cybersécurité', category: 'training', deadlineAt: now + 46 * DAY, geographicScope: 'Togo', fundingLevel: 'fully_funded', sourceName: 'ANPE Togo', status: 'active', progress: 5 },
  { _id: 's3', title: 'Business Analyst — Junior', category: 'jobs', deadlineAt: now + 12 * DAY, geographicScope: 'Togo', fundingLevel: 'partial', sourceName: 'Ecobank Togo', location: 'Lomé', status: 'active', progress: 40 },
  { _id: 's8', title: 'Forum de l’emploi des jeunes', category: 'events', deadlineAt: now + 33 * DAY, geographicScope: 'Togo', fundingLevel: 'unfunded', sourceName: 'Emploi Togo', status: 'active', progress: 15 },
  { _id: 'd1', title: 'Bourse DAAD Master en Allemagne', category: 'scholarships', deadlineAt: now + 30 * DAY, geographicScope: 'Allemagne', fundingLevel: 'fully_funded', sourceName: 'Scholars4Dev', status: 'draft', progress: 0 },
  { _id: 'd2', title: 'Tony Elumelu Entrepreneurship', category: 'grants', deadlineAt: now + 40 * DAY, geographicScope: 'Afrique', fundingLevel: 'partial', sourceName: 'After School Africa', status: 'draft', progress: 0 },
];

export type SavedData = {
  byStatus: Record<SavedStatus, SavedApplication[]>;
  counts: Record<SavedStatus, number>;
  total: number;
  closing: { count: number; names: string[] };
};

export function useSavedApplications(): SavedData {
  const byStatus: Record<SavedStatus, SavedApplication[]> = { active: [], draft: [], expired: [] };
  for (const app of APPLICATIONS) byStatus[app.status].push(app);

  const closingApps = byStatus.active.filter((a) => daysUntil(a.deadlineAt) < 7);

  return {
    byStatus,
    counts: { active: byStatus.active.length, draft: byStatus.draft.length, expired: byStatus.expired.length },
    total: APPLICATIONS.length,
    closing: { count: closingApps.length, names: closingApps.map((a) => a.title.split(' ').slice(0, 2).join(' ')) },
  };
}
