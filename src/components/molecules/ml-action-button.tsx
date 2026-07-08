/**
 * Molecule: MlActionButton
 *
 * Botón de acción del Repositorio: `primary` (navy sólido, texto blanco)
 * y `outline` (fondo blanco, borde y texto azul). Soporta estado de
 * carga (spinner) y disabled.
 */

import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { Pressable } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';

const NAVY = '#0F1B4A';
const BLUE = '#1A3FE8';

interface MlActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const MlActionButton = memo<MlActionButtonProps>(
  ({ label, onPress, variant = 'primary', disabled, loading, className }) => {
    const isPrimary = variant === 'primary';
    const inactive = disabled || loading;

    return (
      <Pressable
        onPress={onPress}
        disabled={inactive}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!inactive }}
        className={`rounded-lg items-center justify-center px-4 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          paddingVertical: 14,
          backgroundColor: isPrimary ? NAVY : '#FFFFFF',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? undefined : 'rgba(26, 63, 232, 0.45)',
          opacity: inactive ? 0.6 : 1,
          boxShadow: isPrimary ? '0 2px 6px rgba(15, 27, 74, 0.25)' : undefined,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={isPrimary ? '#FFFFFF' : BLUE} />
        ) : (
          <AtTypography variant="bodyBold" color={isPrimary ? '#FFFFFF' : BLUE}>
            {label}
          </AtTypography>
        )}
      </Pressable>
    );
  },
);

MlActionButton.displayName = 'MlActionButton';
