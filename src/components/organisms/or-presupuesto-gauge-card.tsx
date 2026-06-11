/**
 * Organism: OrPresupuestoGaugeCard
 *
 * Card "Ejecución" del Informe Presupuesto: título + badge de variación y
 * un medidor semicircular (GaugeChart) con el valor ejecutado al centro.
 * Recicla el GaugeChart del dashboard (charts/gauge-chart).
 */

import React, { memo, useState } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { GaugeChart } from '@/src/components/charts/gauge-chart';
import type { PresupuestoEjecucion } from '@/src/types/presupuesto.types';

interface OrPresupuestoGaugeCardProps {
  ejecucion: PresupuestoEjecucion;
}

const MAX_GAUGE_WIDTH = 280;

/** "$882.62 mil" — escala en miles, dos decimales (como el mockup). */
function formatMil(value: number): string {
  return `$${(value / 1000).toFixed(2)} mil`;
}

export const OrPresupuestoGaugeCard = memo<OrPresupuestoGaugeCardProps>(
  ({ ejecucion }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const gaugeWidth = Math.min(
      MAX_GAUGE_WIDTH,
      Math.max(0, containerWidth - 32),
    );

    return (
      <View
        className="bg-bg-card rounded-lg p-4 gap-3"
        style={{
          borderCurve: 'continuous',
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View className="flex-row items-center gap-2">
          <AtTypography variant="h3" color="#1A1F36">
            Ejecución
          </AtTypography>
          <AtDeltaIndicator value={ejecucion.deltaPct} size="md" />
        </View>

        <View className="items-center justify-center">
          {gaugeWidth > 0 && (
            <View style={{ position: 'relative' }}>
              <GaugeChart
                width={gaugeWidth}
                fraction={ejecucion.fraction}
                gradientId="presupuesto-gauge"
              />
              {/* Valor ejecutado centrado en la base del semicírculo. */}
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  paddingBottom: gaugeWidth * 0.06,
                }}
                pointerEvents="none"
              >
                <AtTypography
                  variant="h2"
                  color="#1A1F36"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatMil(ejecucion.ejecutado)}
                </AtTypography>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  },
);

OrPresupuestoGaugeCard.displayName = 'OrPresupuestoGaugeCard';
