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
  type PolizaPropiedad,
} from '@/src/types/seguros.types';

interface MlPropiedadDetailCardProps {
  poliza: PolizaPropiedad;
  todayIso: string;
}

function formatVencimiento(days: number): string {
  if (days < 0) return `${days} días`;
  if (days === 0) return 'Hoy';
  return `${days} días`;
}

export const MlPropiedadDetailCard = memo<MlPropiedadDetailCardProps>(
  ({ poliza, todayIso }) => {
    const days = diffInDays(poliza.vigenciaFin, todayIso);
    const vencida = days < 0;
    const venceProximo = days >= 0 && days <= 60;
    const alert = vencida || venceProximo;
    const color = vencida ? '#DC2626' : '#D97706';

    return (
      <View
        className="bg-white rounded-lg p-4 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <View>
          <AtTypography variant="caption" color="#8892A4">
            Seguro
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            {poliza.nombre}
          </AtTypography>
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
