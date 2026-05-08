import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { formatCurrency } from '@/src/utils/currency';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MlCostGroupRowProps {
  label: string;
  amount: number;
  deltaPercent: number;
  icon: MaterialIconName;
  color: string;
  onPress?: () => void;
}

export const MlCostGroupRow = memo<MlCostGroupRowProps>(
  ({ label, amount, deltaPercent, icon, color, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        className="flex-row items-center gap-3 py-3 px-4"
      >
        <View
          className="w-9 h-9 rounded-md items-center justify-center"
          style={{ backgroundColor: color, borderCurve: 'continuous' }}
        >
          <AtIcon name={icon} size="sm" color="#FFFFFF" />
        </View>
        <AtTypography variant="bodyBold" className="flex-1" numberOfLines={1}>
          {label} {'\u2192'}
        </AtTypography>
        <View className="flex-row items-center gap-2">
          <AtDeltaIndicator value={deltaPercent} size="sm" />
          <AtTypography
            variant="body"
            color="#4A5568"
            selectable
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatCurrency(amount)}
          </AtTypography>
        </View>
      </Pressable>
    );
  },
);

MlCostGroupRow.displayName = 'MlCostGroupRow';
