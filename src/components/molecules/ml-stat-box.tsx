/**
 * Molecule: MlStatBox
 *
 * Icon + value + label in a box layout.
 * Used in client detail (Empleados, Lider, Vigencia).
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MlStatBoxProps {
  icon: MaterialIconName;
  value: string | number;
  label: string;
  iconColor?: string;
  className?: string;
}

export const MlStatBox = memo<MlStatBoxProps>(
  ({ icon, value, label, iconColor = '#1A2B6D', className }) => {
    return (
      <View
        className={`items-center gap-2 p-3 bg-bg-secondary rounded-lg flex-1 ${className ?? ''}`}
        style={{ borderCurve: 'continuous' }}
      >
        <AtIcon name={icon} size="lg" color={iconColor} />
        <AtTypography variant="h3" selectable>
          {String(value)}
        </AtTypography>
        <AtTypography variant="caption" color="#8892A4">
          {label}
        </AtTypography>
      </View>
    );
  },
);

MlStatBox.displayName = 'MlStatBox';
