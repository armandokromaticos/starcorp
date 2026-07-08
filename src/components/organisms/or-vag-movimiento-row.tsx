/**
 * Organism: OrVagMovimientoRow
 *
 * Fila expandible de la vista Movimientos de VAG: nombre + tipo a la
 * izquierda, fecha y valor a la derecha, chevron para expandir. Expandida
 * muestra Subpartida/Tercero/Observaciones. `highlighted` resalta la card
 * con borde naranja (movimiento al que se navegó desde un activo o una
 * cuenta), mismo lenguaje que las pólizas resaltadas de Seguros.
 */

import React, { memo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { MlDetailGrid } from '@/src/components/molecules/ml-detail-grid';
import { formatCurrency } from '@/src/utils/currency';
import type { VagMovimiento } from '@/src/types/vag.types';

interface OrVagMovimientoRowProps {
  movimiento: VagMovimiento;
  highlighted?: boolean;
  initiallyExpanded?: boolean;
}

/** '2026-01-07' → '7/1/2026' (como el mockup). */
function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}/${y}`;
}

export const OrVagMovimientoRow = memo<OrVagMovimientoRowProps>(
  ({ movimiento, highlighted = false, initiallyExpanded = false }) => {
    const [expanded, setExpanded] = useState(initiallyExpanded);

    return (
      <View
        className="bg-bg-card rounded-xl overflow-hidden"
        style={{
          borderCurve: 'continuous',
          borderWidth: highlighted ? 2 : 1,
          borderColor: highlighted ? '#E8952E' : 'rgba(0, 0, 0, 0.08)',
          boxShadow: highlighted
            ? '0 0 0 3px rgba(232, 149, 46, 0.18)'
            : '0 1px 3px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          className="flex-row items-center gap-2 px-4 py-3"
          accessibilityRole="button"
          accessibilityState={{ expanded }}
        >
          <View className="flex-1 mr-1">
            <AtTypography variant="bodyBold" color="#1A1F36" numberOfLines={1}>
              {movimiento.nombre}
            </AtTypography>
            <AtTypography variant="caption" color="#4A5568">
              {movimiento.tipo}
            </AtTypography>
          </View>
          <AtTypography variant="caption" color="#4A5568">
            {formatFecha(movimiento.fecha)}
          </AtTypography>
          <AtTypography
            variant="captionBold"
            color="#1A1F36"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatCurrency(movimiento.valor)}
          </AtTypography>
          <AtIcon
            name={expanded ? 'expand-less' : 'expand-more'}
            size="md"
            color="#1A1F36"
          />
        </Pressable>

        {expanded && (
          <View
            className="px-4 py-3"
            style={{ backgroundColor: '#F5F7FA' }}
          >
            <MlDetailGrid
              pairs={[
                { label: 'Subpartida', value: movimiento.subpartida },
                { label: 'Tercero', value: movimiento.tercero },
                {
                  label: 'Observaciones',
                  value: movimiento.observaciones,
                  fullWidth: true,
                },
              ]}
            />
          </View>
        )}
      </View>
    );
  },
);

OrVagMovimientoRow.displayName = 'OrVagMovimientoRow';
