/**
 * Molecule: MlVehiculoDetailCard
 *
 * Card de póliza de Vehículo: header "Vehículo" + nombre, divider, y
 * dos campos (Asignación, Vigencia/Vencimiento) en una grid 2x1.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDivider } from '@/src/components/atoms/at-divider';
import {
  diffInDays,
  formatVigenciaDate,
  inactivaLabel,
  isInactiva,
  type PolizaVehiculo,
} from '@/src/types/seguros.types';

interface MlVehiculoDetailCardProps {
  poliza: PolizaVehiculo;
  todayIso: string;
  /** Resalta la card (póliza a la que se navegó desde el informe). */
  highlighted?: boolean;
}

function formatVencimiento(days: number): string {
  if (days < 0) return `${days} días`;
  if (days === 0) return 'Hoy';
  return `${days} días`;
}

export const MlVehiculoDetailCard = memo<MlVehiculoDetailCardProps>(
  ({ poliza, todayIso, highlighted = false }) => {
    const days = diffInDays(poliza.vigenciaFin, todayIso);
    const inactiva = isInactiva(poliza);
    const vencida = days < 0;
    const venceProximo = days >= 0 && days <= 60;
    // Una póliza inactiva no alerta por vencimiento.
    const alert = !inactiva && (vencida || venceProximo);
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
            Vehículo
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            {poliza.nombre}
          </AtTypography>
          {inactiva && (
            <View
              className="self-start mt-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
            >
              <AtTypography variant="caption" color="#4A5568">
                {inactivaLabel(poliza)}
              </AtTypography>
            </View>
          )}
        </View>

        <AtDivider />

        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <AtIcon name="account-circle" size="sm" color="#1A1F36" />
              <AtTypography variant="bodyBold" color="#1A1F36">
                Asignación
              </AtTypography>
            </View>
            <AtTypography variant="caption" color="#4A5568">
              {poliza.asignacion}
            </AtTypography>
          </View>
        </View>

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

MlVehiculoDetailCard.displayName = 'MlVehiculoDetailCard';
