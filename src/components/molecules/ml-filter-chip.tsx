/**
 * Molecule: MlFilterChip
 *
 * Pill navy con label y botón X para remover. Usada en la barra de
 * filtros aplicados y dentro del bottom sheet de filtros.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface MlFilterChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const MlFilterChip = memo<MlFilterChipProps>(
  ({ label, onRemove, className }) => {
    return (
      <View
        className={`flex-row items-center gap-2 rounded-full pl-3 pr-2 py-1.5 ${className ?? ''}`}
        style={{
          backgroundColor: '#1A3FE8',
          borderCurve: 'continuous',
        }}
      >
        <AtTypography variant="captionBold" color="#FFFFFF">
          {label}
        </AtTypography>
        <Pressable onPress={onRemove} hitSlop={8}>
          <AtIcon name="close" size="sm" color="#FFFFFF" />
        </Pressable>
      </View>
    );
  },
);

MlFilterChip.displayName = 'MlFilterChip';
