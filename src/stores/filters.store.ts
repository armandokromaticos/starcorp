/**
 * Filters Store — Zustand
 *
 * Manages active time period and company selection.
 */

import { create } from 'zustand';
import type { PeriodKey, PeriodRange } from '@/src/types/domain.types';
import { computePeriod } from '@/src/utils/date';

interface FiltersState {
  activePeriodKey: PeriodKey;
  activePeriod: PeriodRange;
  selectedCompanyId: string | null;
  setActivePeriod: (key: PeriodKey) => void;
  setSelectedCompany: (id: string) => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
  activePeriodKey: 'today',
  activePeriod: computePeriod('today'),
  selectedCompanyId: null,

  setActivePeriod: (key) =>
    set({
      activePeriodKey: key,
      activePeriod: computePeriod(key),
    }),

  setSelectedCompany: (id) => set({ selectedCompanyId: id }),
}));
