// Category metadata: the 8 MVP categories with their French badge label and the
// pastel badge colours from the design. Class strings are written out in full
// (no dynamic concatenation) so NativeWind's content scanner keeps them.

export type Category =
  | 'scholarships'
  | 'jobs'
  | 'fellowships'
  | 'grants'
  | 'contests'
  | 'training'
  | 'events'
  | 'volunteer';

type CategoryMeta = {
  /** Singular badge label, e.g. "Bourse". */
  badge: string;
  /** Plural filter-chip label, e.g. "Bourses". */
  chip: string;
  badgeBg: string;
  badgeText: string;
  /** Emoji + one-line blurb for the onboarding interest picker. */
  emoji: string;
  blurb: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  scholarships: { badge: 'Bourse', chip: 'Bourses', badgeBg: 'bg-cat-scholarships-bg', badgeText: 'text-cat-scholarships', emoji: '🎓', blurb: 'Master, Doctorat' },
  jobs: { badge: 'Emploi', chip: 'Emplois', badgeBg: 'bg-cat-jobs-bg', badgeText: 'text-cat-jobs', emoji: '💼', blurb: 'Stages, CDD, CDI' },
  fellowships: { badge: 'Fellowship', chip: 'Fellowships', badgeBg: 'bg-cat-fellowships-bg', badgeText: 'text-cat-fellowships', emoji: '🌍', blurb: 'Programmes internationaux' },
  grants: { badge: 'Subvention', chip: 'Subventions', badgeBg: 'bg-cat-grants-bg', badgeText: 'text-cat-grants', emoji: '💡', blurb: 'Entrepreneurs' },
  contests: { badge: 'Concours', chip: 'Concours', badgeBg: 'bg-cat-contests-bg', badgeText: 'text-cat-contests', emoji: '🏆', blurb: 'Pitch, hackathon' },
  training: { badge: 'Formation', chip: 'Formations', badgeBg: 'bg-cat-training-bg', badgeText: 'text-cat-training', emoji: '📚', blurb: 'Courtes, en ligne' },
  events: { badge: 'Événement', chip: 'Événements', badgeBg: 'bg-cat-events-bg', badgeText: 'text-cat-events', emoji: '🎤', blurb: 'Conférences, forums' },
  volunteer: { badge: 'Bénévolat', chip: 'Bénévolat', badgeBg: 'bg-cat-volunteer-bg', badgeText: 'text-cat-volunteer', emoji: '🤝', blurb: 'Associations, ONG' },
};

// Ordered list for the home filter chips ("Tout" is prepended in the UI).
export const CATEGORY_ORDER: Category[] = [
  'scholarships',
  'jobs',
  'fellowships',
  'grants',
  'contests',
  'training',
  'events',
  'volunteer',
];

export type FundingLevel = 'fully_funded' | 'partial' | 'unfunded' | 'unknown';

export const FUNDING_LABEL: Record<FundingLevel, string> = {
  fully_funded: 'Entièrement financée',
  partial: 'Financement partiel',
  unfunded: 'Non financé',
  unknown: '',
};
