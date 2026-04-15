/**
 * Molecule: MlMetricCard
 *
 * Card with icon, label, amount, and delta indicator.
 * Used in Financiero section for Ingresos/Costos/Gastos summary.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MlMetricCardProps {
  label: string;
  value: number;
  deltaPercent?: number;
  icon?: MaterialIconName;
  iconColor?: string;
  onPress?: () => void;
  className?: string;
}

export const MlMetricCard = memo<MlMetricCardProps>(
  ({ label, value, deltaPercent, icon, iconColor = '#1A2B6D', onPress, className }) => {
    return (
      <Pressable
        onPress={onPress}
        className={`bg-bg-card rounded-lg p-4 gap-2 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {icon && (
          <AtIcon name={icon} size="lg" color={iconColor} />
        )}
        <AtTypography variant="caption" color="#8892A4">
          {label}
        </AtTypography>
        <AtMetricValue value={value} size="md" />
        {deltaPercent != null && (
          <AtDeltaIndicator value={deltaPercent} size="sm" />
        )}
      </Pressable>
    );
  },
);

MlMetricCard.displayName = 'MlMetricCard';
