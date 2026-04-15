/**
 * Molecule: TimeFilterBar
 *
 * Horizontal scrollable row of Chip atoms for period selection.
 * Matches mockup: [Hoy] [1 semana] [1 mes] [3 meses] [12 meses]
 */

import React, { memo, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { Chip } from '@/src/components/atoms/chip';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import { tokens } from '@/src/theme/tokens';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIODS: PeriodKey[] = ['today', '1w', '1m', '3m', '12m'];

export const TimeFilterBar = memo(() => {
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);

  const handlePress = useCallback(
    (key: PeriodKey) => {
      setActivePeriod(key);
    },
    [setActivePeriod],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: tokens.spacing.sm,
        paddingHorizontal: tokens.spacing.lg,
      }}
    >
      {PERIODS.map((key) => (
        <Chip
          key={key}
          label={PERIOD_LABELS[key]}
          selected={activePeriodKey === key}
          onPress={() => handlePress(key)}
        />
      ))}
    </ScrollView>
  );
});

TimeFilterBar.displayName = 'TimeFilterBar';
