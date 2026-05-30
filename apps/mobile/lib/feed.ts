// Home-feed data layer. Today it returns hand-built mock data so the design can
// be reviewed on-device before Convex is provisioned. Once `npx convex dev` has
// generated the API, swap the body of `useHomeFeed` for:
//
//   const data = useQuery(api.opportunities.homeFeed, { category });
//   return { closingThisWeek: data?.closingThisWeek ?? [], forYou: data?.forYou ?? [], isLoading: data === undefined };
//
// The shape below matches convex/opportunities.ts::homeFeed exactly.

import type { Category, FundingLevel } from './categories';

export type FeedOpportunity = {
  _id: string;
  title: string;
  category: Category;
  deadlineAt: number;
  geographicScope: string;
  fundingLevel: FundingLevel;
  sourceName: string;
  format?: string;
  duration?: string;
  /** Optional, mock-only flavour for the featured card footer. */
  applicants?: number;
  /** Mock-only secondary location line, e.g. "Lomé". */
  location?: string;
};

export type HomeFeed = {
  closingThisWeek: FeedOpportunity[];
  forYou: FeedOpportunity[];
  isLoading: boolean;
};

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const MOCK_CLOSING: FeedOpportunity[] = [
  {
    _id: 'm1',
    title: 'Bourse Eiffel Excellence 2026',
    category: 'scholarships',
    deadlineAt: now + 1 * DAY,
    geographicScope: 'Master en France',
    fundingLevel: 'fully_funded',
    sourceName: 'Campus France',
    applicants: 284,
  },
];

const MOCK_FORYOU: FeedOpportunity[] = [
  {
    _id: 'm2',
    title: 'Business Analyst — Junior',
    category: 'jobs',
    deadlineAt: now + 12 * DAY,
    geographicScope: 'Ecobank Togo',
    fundingLevel: 'partial',
    sourceName: 'Ecobank Togo',
    location: 'Lomé',
    duration: '6 mois',
  },
  {
    _id: 'm3',
    title: 'Mandela Washington Fellowship 2026',
    category: 'fellowships',
    deadlineAt: now + 21 * DAY,
    geographicScope: 'Afrique',
    fundingLevel: 'fully_funded',
    sourceName: 'After School Africa',
  },
  {
    _id: 'm4',
    title: 'Bourse DAAD Master en Allemagne',
    category: 'scholarships',
    deadlineAt: now + 34 * DAY,
    geographicScope: 'Allemagne',
    fundingLevel: 'fully_funded',
    sourceName: 'Scholars4Dev',
  },
  {
    _id: 'm5',
    title: 'Formation en cybersécurité',
    category: 'training',
    deadlineAt: now + 46 * DAY,
    geographicScope: 'Togo',
    fundingLevel: 'fully_funded',
    sourceName: 'ANPE Togo',
    duration: '8 semaines',
  },
];

export function useHomeFeed(category?: Category): HomeFeed {
  // --- mock implementation (swap for Convex useQuery — see file header) ---
  const filter = (list: FeedOpportunity[]) =>
    category ? list.filter((o) => o.category === category) : list;
  return {
    closingThisWeek: filter(MOCK_CLOSING),
    forYou: filter(MOCK_FORYOU),
    isLoading: false,
  };
}
