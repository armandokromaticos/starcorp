/**
 * Molecule: MlPropiedadDetailCard
 *
 * Card de póliza de Propiedad: header "Seguro" + nombre, divider, y
 * un campo de Vigencia/Vencimiento.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDivider } from '@/src/components/atoms/at-divider';
import {
  diffInDays,
  formatVigenciaDate,
  isCancelada,
  type PolizaPropiedad,
} from '@/src/types/seguros.types';

interface MlPropiedadDetailCardProps {
  poliza: PolizaPropiedad;
  todayIso: string;
  /** Resalta la card (póliza a la que se navegó desde el informe). */
  highlighted?: boolean;
}

function formatVencimiento(days: number): string {
  if (days < 0) return `${days} días`;
  if (days === 0) return 'Hoy';
  return `${days} días`;
}

export const MlPropiedadDetailCard = memo<MlPropiedadDetailCardProps>(
  ({ poliza, todayIso, highlighted = false }) => {
    const days = diffInDays(poliza.vigenciaFin, todayIso);
    const cancelada = isCancelada(poliza);
    const vencida = days < 0;
    const venceProximo = days >= 0 && days <= 60;
    // Una póliza cancelada no alerta por vencimiento.
    const alert = !cancelada && (vencida || venceProximo);
    const color = vencida ? '#DC2626' : '#D97706';

    return (
      <View
        className="bg-white rounded-lg p-4 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted ? '#E8952E' : 'rgba(0,0,0,0.06)',
          boxShadow: highlighted
            ? '0 0 0 3px rgba(232, 149, 46, 0.18)'
            : undefined,
        }}
      >
        <View>
          <AtTypography variant="caption" color="#8892A4">
            Seguro
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            {poliza.nombre}
          </AtTypography>
          {cancelada && (
            <View
              className="self-start mt-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
            >
              <AtTypography variant="caption" color="#4A5568">
                Cancelada
              </AtTypography>
            </View>
          )}
        </View>

        <AtDivider />

        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <AtIcon name="schedule" size="sm" color="#1A1F36" />
              <AtTypography variant="bodyBold" color="#1A1F36">
                Vigencia
              </AtTypography>
            </View>
            <AtTypography variant="caption" color="#4A5568">
              {formatVigenciaDate(poliza.vigenciaFin)}
            </AtTypography>
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              {alert && <AtIcon name="warning-amber" size="sm" color={color} />}
              <AtTypography
                variant="bodyBold"
                color={alert ? color : '#1A1F36'}
              >
                Vencimiento
              </AtTypography>
            </View>
            <AtTypography
              variant="caption"
              color={alert ? color : '#4A5568'}
            >
              {formatVencimiento(days)}
            </AtTypography>
          </View>
        </View>
      </View>
    );
  },
);

MlPropiedadDetailCard.displayName = 'MlPropiedadDetailCard';
