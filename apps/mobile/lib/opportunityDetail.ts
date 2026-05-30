// Detail data layer for the opportunity screen. Mock-backed for now; swap
// `useOpportunity` for `useQuery(api.opportunities.getById, { id })` once Convex
// is live (the shape below is a superset of homeFeed's item + source fields).

import type { Category, FundingLevel } from './categories';

export type OpportunityDetail = {
  _id: string;
  title: string;
  category: Category;
  deadlineAt: number;
  geographicScope: string;
  fundingLevel: FundingLevel;
  sourceName: string;
  sourceTagline?: string; // e.g. "Programme officiel"
  sourceVerified: boolean;
  applyUrl: string;
  location?: string;
  // Fact pills shown under the title (e.g. ["Master", "Entièrement financée"]).
  factTags: string[];
  // Key-facts card (serif numerals).
  amount?: string; // "1 181 €"
  amountUnit?: string; // "/mois"
  amountNote?: string; // "+ voyage & visa"
  durationValue?: string; // "12-24"
  durationUnit?: string; // "mois"
  // Body.
  description: string;
  eligibilityBullets: string[];
  coverage: string;
  howToApply: string;
};

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const BASE: Omit<OpportunityDetail, '_id'> = {
  title: 'Bourse Eiffel Excellence 2026',
  category: 'scholarships',
  deadlineAt: now + 4 * DAY,
  geographicScope: 'France',
  fundingLevel: 'fully_funded',
  sourceName: 'Campus France',
  sourceTagline: 'Programme officiel',
  sourceVerified: true,
  applyUrl: 'https://www.campusfrance.org/fr/eiffel',
  location: 'France',
  factTags: ['Master', 'Entièrement financée'],
  amount: '1 181 €',
  amountUnit: '/mois',
  amountNote: '+ voyage & visa',
  durationValue: '12-24',
  durationUnit: 'mois',
  description:
    "Le programme Eiffel finance les meilleurs étudiants étrangers inscrits en Master dans un établissement français. Ouvert aux candidats de moins de 25 ans, hors UE.",
  eligibilityBullets: [
    'Tu vises un Master 1 ou 2 en France',
    'Tu as moins de 25 ans à la candidature',
    "Tu n'es pas ressortissant de l'Union européenne",
    'Ton établissement français porte ta candidature',
  ],
  coverage:
    'Allocation mensuelle de 1 181 €, billet aller-retour, couverture sociale, et indemnités de logement et de transport.',
  howToApply:
    "La candidature est déposée par l'établissement français, pas par l'étudiant. Contacte le service des relations internationales de ton université d'accueil.",
};

const DETAILS: Record<string, OpportunityDetail> = {
  m1: { ...BASE, _id: 'm1' },
};

export function useOpportunity(id: string): OpportunityDetail | undefined {
  // --- mock (swap for Convex useQuery — see file header) ---
  return DETAILS[id] ?? { ...BASE, _id: id };
}

/** Host shown on the sticky bar, e.g. "campusfrance.org". */
export function applyDomain(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}
