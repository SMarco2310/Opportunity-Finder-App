// Explore search, mock-backed. Swap `useSearch` for:
//   useQuery(api.opportunities.search, { searchTerm, category, fundingLevel })
// once Convex is live. Matching here is a simple case-insensitive title/scope
// filter; the real query uses Convex's full-text search index.

import type { Category, FundingLevel } from './categories';
import type { FeedOpportunity } from './feed';

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const POOL: FeedOpportunity[] = [
  { _id: 's1', title: 'Bourse Eiffel Excellence 2026', category: 'scholarships', deadlineAt: now + 1 * DAY, geographicScope: 'France', fundingLevel: 'fully_funded', sourceName: 'Campus France' },
  { _id: 's2', title: 'Bourse DAAD Master en Allemagne', category: 'scholarships', deadlineAt: now + 34 * DAY, geographicScope: 'Allemagne', fundingLevel: 'fully_funded', sourceName: 'Scholars4Dev' },
  { _id: 's3', title: 'Business Analyst — Junior', category: 'jobs', deadlineAt: now + 12 * DAY, geographicScope: 'Togo', fundingLevel: 'partial', sourceName: 'Ecobank Togo', location: 'Lomé', duration: '6 mois' },
  { _id: 's4', title: 'Mandela Washington Fellowship 2026', category: 'fellowships', deadlineAt: now + 21 * DAY, geographicScope: 'Afrique', fundingLevel: 'fully_funded', sourceName: 'After School Africa' },
  { _id: 's5', title: 'Tony Elumelu Entrepreneurship Programme', category: 'grants', deadlineAt: now + 40 * DAY, geographicScope: 'Afrique', fundingLevel: 'partial', sourceName: 'After School Africa' },
  { _id: 's6', title: 'Hackathon Tech Togo 2026', category: 'contests', deadlineAt: now + 28 * DAY, geographicScope: 'Togo', fundingLevel: 'partial', sourceName: 'Emploi Togo', location: 'Lomé' },
  { _id: 's7', title: 'Formation en cybersécurité', category: 'training', deadlineAt: now + 46 * DAY, geographicScope: 'Togo', fundingLevel: 'fully_funded', sourceName: 'ANPE Togo', duration: '8 semaines' },
  { _id: 's8', title: 'Forum de l’emploi des jeunes', category: 'events', deadlineAt: now + 33 * DAY, geographicScope: 'Togo', fundingLevel: 'unfunded', sourceName: 'Emploi Togo', location: 'Lomé' },
];

export function useSearch({
  searchTerm,
  categories,
  fundingLevel,
}: {
  searchTerm: string;
  categories: Category[];
  fundingLevel: FundingLevel | null;
}): { results: FeedOpportunity[]; isLoading: boolean } {
  const term = searchTerm.trim().toLowerCase();
  const results = POOL.filter((o) => {
    if (term && !`${o.title} ${o.geographicScope} ${o.sourceName}`.toLowerCase().includes(term)) {
      return false;
    }
    if (categories.length > 0 && !categories.includes(o.category)) return false;
    if (fundingLevel && o.fundingLevel !== fundingLevel) return false;
    return true;
  }).sort((a, b) => a.deadlineAt - b.deadlineAt);
  return { results, isLoading: false };
}
