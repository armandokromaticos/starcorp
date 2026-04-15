/**
 * Molecule: MlCompanyCard
 *
 * Company card with icon, name, total revenue, and delta.
 * Used in Financiero section (5 Stars, One A, etc.).
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';

interface MlCompanyCardProps {
  name: string;
  totalLabel: string;
  totalValue: number;
  deltaPercent?: number;
  onPress?: () => void;
  className?: string;
}

export const MlCompanyCard = memo<MlCompanyCardProps>(
  ({ name, totalLabel, totalValue, deltaPercent, onPress, className }) => {
    return (
      <Pressable
        onPress={onPress}
        className={`bg-navy rounded-lg p-4 gap-2 flex-1 ${className ?? ''}`}
        style={{ borderCurve: 'continuous' }}
      >
        <View className="flex-row items-center gap-2">
          <AtIcon name="business" size="md" color="#FFFFFF" />
          <AtTypography variant="captionBold" color="#FFFFFF">
            {name}
          </AtTypography>
        </View>

        {deltaPercent != null && (
          <AtDeltaIndicator value={deltaPercent} size="sm" />
        )}

        <AtTypography variant="caption" color="rgba(255,255,255,0.7)">
          {totalLabel}
        </AtTypography>
        <AtTypography variant="metricSmall" color="#FFFFFF" selectable>
          ${totalValue.toLocaleString()}
        </AtTypography>
      </Pressable>
    );
  },
);

MlCompanyCard.displayName = 'MlCompanyCard';
