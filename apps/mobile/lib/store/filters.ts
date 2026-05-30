import { create } from 'zustand';

import type { Category, FundingLevel } from '@/lib/categories';

// Explore filter state in Zustand so it survives tab switches (plan §6).
// Server state still comes from Convex hooks — this only holds UI selections.
type FilterState = {
  searchTerm: string;
  categories: Category[];
  fundingLevel: FundingLevel | null;
  destination: string | null; // geographic scope, e.g. "Europe"
  educationLevel: string | null; // e.g. "Master"
  setSearchTerm: (term: string) => void;
  toggleCategory: (category: Category) => void;
  setFundingLevel: (level: FundingLevel | null) => void;
  setDestination: (destination: string | null) => void;
  setEducationLevel: (level: string | null) => void;
  reset: () => void;
};

export const DESTINATIONS = ['Togo', 'Afrique', 'Europe', 'International'];
export const EDUCATION_LEVELS = ['Bac', 'Licence', 'Master', 'Doctorat'];

export const useFilters = create<FilterState>((set) => ({
  searchTerm: '',
  categories: [],
  fundingLevel: null,
  destination: null,
  educationLevel: null,
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  toggleCategory: (category) =>
    set((s) => ({
      categories: s.categories.includes(category)
        ? s.categories.filter((c) => c !== category)
        : [...s.categories, category],
    })),
  setFundingLevel: (fundingLevel) => set({ fundingLevel }),
  setDestination: (destination) => set({ destination }),
  setEducationLevel: (educationLevel) => set({ educationLevel }),
  reset: () => set({ categories: [], fundingLevel: null, destination: null, educationLevel: null }),
}));
