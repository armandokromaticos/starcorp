/**
 * Organism: OrExpenseCentralCard
 *
 * "Gastos central" pill at the top of /gastos. Dark navy gradient body
 * highlighted by a thin blue stroke; title on the top-left, delta chip on
 * the top-right, big amount underneath.
 */

import React, { memo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from '@/src/tw';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface OrExpenseCentralCardProps {
  total: number;
  deltaPercent: number;
}

export const OrExpenseCentralCard = memo<OrExpenseCentralCardProps>(
  ({ total, deltaPercent }) => {
    return (
      <View
        className="mx-4"
        style={{
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: '#4A7FD4',
          borderCurve: 'continuous',
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#1A2B6D', '#0B1638']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 6 }}
        >
          <View className="flex-row justify-between items-center">
            <AtTypography variant="bodyBold" color="#FFFFFF">
              Gastos central
            </AtTypography>
            <AtDeltaIndicator
              value={deltaPercent}
              size="sm"
              appearance="dark"
            />
          </View>
          <AtMetricValue value={total} size="lg" color="#FFFFFF" />
        </LinearGradient>
      </View>
    );
  },
);

OrExpenseCentralCard.displayName = 'OrExpenseCentralCard';
