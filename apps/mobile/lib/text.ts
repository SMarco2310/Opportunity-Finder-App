// Small text helpers shared by cards.

/** Initials from a source name, e.g. "Campus France" -> "CF". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

/** If the title ends in a 4-digit year, split it off so it can be accented. */
export function splitTrailingYear(title: string): { head: string; year: string | null } {
  const match = title.match(/^(.*?)[\s—-]*\b(\d{4})\s*$/);
  if (match && Number(match[2]) >= 2000 && Number(match[2]) <= 2099) {
    return { head: match[1].trim(), year: match[2] };
  }
  return { head: title, year: null };
}
