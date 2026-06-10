/**
 * Molecule: MlCarteraClientRow
 *
 * Fila de cliente del Informe Cartera. Tap en la fila la expande para
 * mostrar el desglose por bucket; tap en la flecha lleva al detalle
 * de facturas ("Gestión carteras vencidas").
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDivider } from '@/src/components/atoms/at-divider';
import {
  AGING_BUCKETS,
  AGING_BUCKET_LABEL,
  type AgingBucket,
} from '@/src/types/cartera.types';

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Anchos de columna compartidos con el header de la lista
// (app/(tabs)/informes/cartera/index.tsx). Mantener sincronizados.
export const CARTERA_BUCKET_COL_W = 108;
export const CARTERA_TOTAL_COL_W = 96;

interface MlCarteraClientRowProps {
  name: string;
  color: string;
  activeBucket: AgingBucket;
  buckets: Record<AgingBucket, number>;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
}

export const MlCarteraClientRow = memo<MlCarteraClientRowProps>(
  ({
    name,
    color,
    activeBucket,
    buckets,
    total,
    expanded,
    onToggle,
    onOpenDetail,
  }) => {
    return (
      <View
        className="bg-bg-card rounded-lg"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          className="flex-row items-center px-4 py-3 gap-3"
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: color,
            }}
          />
          <Pressable
            onPress={onOpenDetail}
            hitSlop={6}
            className="flex-row items-center gap-1 flex-1"
          >
            <AtTypography variant="captionBold" numberOfLines={2}>
              {name}
            </AtTypography>
            <AtIcon name="arrow-forward" size="sm" color="#1A1F36" />
          </Pressable>
          <View
            style={{ width: CARTERA_BUCKET_COL_W }}
            className="items-end"
          >
            {!expanded && (
              <AtTypography
                variant="caption"
                color="#4A5568"
                numberOfLines={1}
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatMoney(buckets[activeBucket])}
              </AtTypography>
            )}
          </View>
          <View
            style={{ width: CARTERA_TOTAL_COL_W }}
            className="items-end"
          >
            <AtTypography
              variant="captionBold"
              numberOfLines={1}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatMoney(total)}
            </AtTypography>
          </View>
        </Pressable>

        {expanded && (
          <View className="pb-3">
            <AtDivider className="mx-4 mb-2" />
            {AGING_BUCKETS.map((bucket) => (
              <View
                key={bucket}
                className="flex-row items-center justify-between px-4 py-1.5"
              >
                <AtTypography variant="body" color="#4A5568">
                  {AGING_BUCKET_LABEL[bucket]}
                  {bucket !== 'corriente' ? ' días' : ''}
                </AtTypography>
                <AtTypography variant="body" color="#1A1F36">
                  {formatMoney(buckets[bucket])}
                </AtTypography>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  },
);

MlCarteraClientRow.displayName = 'MlCarteraClientRow';
