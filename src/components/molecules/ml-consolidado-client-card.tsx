import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { formatCurrency } from '@/src/utils/currency';

interface MlConsolidadoClientCardProps {
  name: string;
  amountLabel: string;
  amount: number;
  deltaPercent: number;
  onPress?: () => void;
}

export const MlConsolidadoClientCard = memo<MlConsolidadoClientCardProps>(
  ({ name, amountLabel, amount, deltaPercent, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        className="bg-navy rounded-lg px-4 py-3 mx-4"
        style={{ borderCurve: 'continuous' }}
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 gap-1">
            <AtTypography variant="bodyBold" color="#FFFFFF" numberOfLines={1}>
              {name} {'\u2192'}
            </AtTypography>
            <AtTypography variant="captionBold" color="#FFFFFF">
              {amountLabel}: {formatCurrency(amount)}
            </AtTypography>
          </View>
          <AtDeltaIndicator value={deltaPercent} size="sm" appearance="dark" />
        </View>
      </Pressable>
    );
  },
);

MlConsolidadoClientCard.displayName = 'MlConsolidadoClientCard';
