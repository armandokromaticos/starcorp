/**
 * Molecule: MlPolizaAlertRow
 *
 * Card usada en las listas "Pólizas por vencer / vencidas" del index
 * de Seguros. Icono warning (amber para por vencer, red para vencida) +
 * nombre + vigencia/días vencidos + flecha →.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';

interface MlPolizaAlertRowProps {
  /** Línea principal (bold 14): empresa en Compañías, nombre en Vehículos/Propiedades. */
  title: string;
  /** Línea secundaria opcional (12): nombre de póliza, asignación, etc. */
  subtitle?: string;
  /** Texto secundario (ej. "Vigencia: 25/05/2026" o "Vigencia: -320 días"). */
  subline: string;
  variant: 'por_vencer' | 'vencida';
  onPress?: () => void;
}

const COLORS = {
  por_vencer: { bg: '#FEF3C7', icon: '#D97706', text: '#1A1F36' },
  vencida: { bg: '#FEE2E2', icon: '#DC2626', text: '#DC2626' },
} as const;

export const MlPolizaAlertRow = memo<MlPolizaAlertRowProps>(
  ({ title, subtitle, subline, variant, onPress }) => {
    const tone = COLORS[variant];
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        className="bg-white rounded-lg flex-row items-center px-3 py-3 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <View
          className="items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            backgroundColor: tone.bg,
            borderCurve: 'continuous',
          }}
        >
          <AtIcon name="warning-amber" size={20} color={tone.icon} />
        </View>
        <View className="flex-1">
          <AtTypography
            variant="bodyBold"
            color="#1A1F36"
            numberOfLines={1}
            style={{ fontSize: 14, lineHeight: 18 }}
          >
            {title}
          </AtTypography>
          {subtitle && (
            <AtTypography
              variant="body"
              color="#1A1F36"
              numberOfLines={1}
              style={{ fontSize: 12, lineHeight: 16 }}
            >
              {subtitle}
            </AtTypography>
          )}
          <AtTypography variant="caption" color={tone.text}>
            {subline}
          </AtTypography>
        </View>
        <AtIcon name="arrow-forward" size="sm" color="#1A1F36" />
      </Pressable>
    );
  },
);

MlPolizaAlertRow.displayName = 'MlPolizaAlertRow';
