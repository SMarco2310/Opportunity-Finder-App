// Deadline helpers: days remaining + urgency colour. The big serif numeral on
// each card is the design's signature element, so its colour rule lives here:
//   red  < 7 days   ·   amber < 30 days   ·   green >= 30 days

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysUntil(deadlineAt: number, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((deadlineAt - now) / DAY_MS));
}

export type Urgency = 'red' | 'amber' | 'green';

export function urgencyOf(days: number): Urgency {
  if (days < 7) return 'red';
  if (days < 30) return 'amber';
  return 'green';
}

// Tailwind text-colour class for the numeral, by urgency (literal strings).
export const URGENCY_TEXT: Record<Urgency, string> = {
  red: 'text-urgency-red',
  amber: 'text-urgency-amber',
  green: 'text-urgency-green',
};

// Full date for the detail screen, in French.
export function formatFullDate(deadlineAt: number): string {
  return new Date(deadlineAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Short date, e.g. "2 juin" — used in the key-facts card.
export function formatShortDate(deadlineAt: number): string {
  return new Date(deadlineAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}
