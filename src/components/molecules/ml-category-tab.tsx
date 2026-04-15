/**
 * Molecule: MlCategoryTab
 *
 * Dark navy card with icon, label, and action link.
 * Used in the horizontal category carousel (Ingresos, Costos, Gastos, Utilidad).
 * Fixed: uses AtIcon + CSS tokens instead of hardcoded hex/emojis.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MlCategoryTabProps {
  label: string;
  icon: MaterialIconName;
  actionLabel: string;
  onPress?: () => void;
  statusColor?: string;
}

export const MlCategoryTab = memo<MlCategoryTabProps>(
  ({
    label,
    icon,
    actionLabel,
    onPress,
    statusColor = '#E8952E',
  }) => {
    return (
      <Pressable
        onPress={onPress}
        className="bg-navy rounded-lg p-4 w-[130px] gap-3 justify-between"
        style={{ borderCurve: 'continuous' }}
      >
        <View className="flex-row justify-between items-center">
          <AtIcon name={icon} size="xl" color="#FFFFFF" />
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: statusColor,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          />
        </View>

        <AtTypography variant="bodyBold" color="#FFFFFF">
          {label}
        </AtTypography>

        <AtTypography variant="caption" color="rgba(255,255,255,0.7)">
          {actionLabel} {'\u2192'}
        </AtTypography>
      </Pressable>
    );
  },
);

MlCategoryTab.displayName = 'MlCategoryTab';
