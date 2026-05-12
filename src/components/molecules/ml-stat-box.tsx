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
  variant?: 'light' | 'dark';
  className?: string;
}

export const MlStatBox = memo<MlStatBoxProps>(
  ({ icon, value, label, iconColor = '#1A2B6D', variant = 'light', className }) => {
    const isDark = variant === 'dark';
    return (
      <View
        className={`items-center justify-between p-4 rounded-lg flex-1 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          backgroundColor: isDark ? '#0E173C' : '#F5F5F7',
        }}
      >
        <View className="items-center gap-2">
          <AtIcon name={icon} size="lg" color={iconColor} />
          <AtTypography
            variant="h3"
            color={isDark ? '#FFFFFF' : '#1A1F36'}
            selectable
          >
            {String(value)}
          </AtTypography>
        </View>
        <AtTypography
          variant="caption"
          color={isDark ? 'rgba(255,255,255,0.75)' : '#8892A4'}
          style={{ textAlign: 'center', marginTop: 4 }}
        >
          {label}
        </AtTypography>
      </View>
    );
  },
);

MlStatBox.displayName = 'MlStatBox';
