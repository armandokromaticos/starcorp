/**
 * Organism: OrEmpresaDonutCard
 *
 * Card blanca del detalle de compañía: header (título + chip de periodo),
 * valor total y donut por categoría (Honorarios, Otros, Arrendamientos,
 * Gastos de personal).
 *
 * Sigue el mismo patrón que el resto de donuts de la app
 * (OrThirdPartiesDonutCard): centro vacío por defecto, tap en un sector
 * muestra su % en el centro y su leyenda (dot + nombre + monto) debajo;
 * sin selección se muestra el hint "Toca un sector…".
 *
 * La selección puede elevarse al padre con `selectedId`/`onSelectChange`
 * (cross-filtrado con la lista de terceros, como financiero/ingresos);
 * sin esas props funciona igual que antes con estado interno.
 */

import React, { memo, useMemo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { DonutChart } from '@/src/components/charts/donut-chart';
import { formatCurrency } from '@/src/utils/currency';
import type { EmpresaCategory } from '@/src/types/empresas.types';

interface OrEmpresaDonutCardProps {
  title: string;
  periodLabel: string;
  total: number;
  categories: EmpresaCategory[];
  /** Selección controlada por el padre (cross-filtrado con la lista). */
  selectedId?: string | null;
  onSelectChange?: (id: string | null) => void;
  /** Hint bajo el donut cuando no hay sector seleccionado. */
  emptyHint?: string;
}

const DONUT_SIZE = 160;

export const OrEmpresaDonutCard = memo<OrEmpresaDonutCardProps>(
  ({
    title,
    periodLabel,
    total,
    categories,
    selectedId: selectedIdProp,
    onSelectChange,
    emptyHint = 'Toca un sector para ver la categoría',
  }) => {
    const [internalId, setInternalId] = useState<string | null>(null);
    const selectedId = selectedIdProp !== undefined ? selectedIdProp : internalId;
    const setSelectedId = onSelectChange ?? setInternalId;

    const sumTotal = useMemo(
      () => categories.reduce((s, c) => s + c.amount, 0),
      [categories],
    );

    const selectedIndex = useMemo(() => {
      if (!selectedId) return null;
      const i = categories.findIndex((c) => c.id === selectedId);
      return i >= 0 ? i : null;
    }, [categories, selectedId]);

    const selected =
      selectedIndex != null ? categories[selectedIndex] : null;
    const selectedPct =
      selected && sumTotal > 0 ? (selected.amount / sumTotal) * 100 : null;

    const toggle = (id: string) => setSelectedId(selectedId === id ? null : id);

    return (
      <View
        className="bg-bg-card rounded-lg p-4 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header: título + chip de periodo */}
        <View className="flex-row items-center gap-2">
          <AtTypography variant="bodyBold" color="#1A1F36">
            {title}
          </AtTypography>
          <View
            className="rounded-full bg-bg-secondary px-3 py-1"
            style={{ borderCurve: 'continuous' }}
          >
            <AtTypography variant="caption" color="#4A5568">
              {periodLabel}
            </AtTypography>
          </View>
        </View>

        {/* Valor total */}
        <AtMetricValue value={total} size="lg" color="#1A1F36" />

        {/* Donut: centro vacío por defecto; % del sector tocado */}
        <View style={{ alignSelf: 'center' }}>
          <DonutChart
            data={categories.map((c) => ({
              value: c.amount,
              color: c.color,
              label: c.label,
            }))}
            size={DONUT_SIZE}
            innerRadius={0.6}
            padAngle={2}
            onSlicePress={(i) => {
              const id = categories[i]?.id;
              if (id) toggle(id);
            }}
            selectedIndex={selectedIndex}
          >
            {selectedPct != null && (
              <AtTypography
                variant="h2"
                color="#1A1F36"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {`${selectedPct.toFixed(1)}%`}
              </AtTypography>
            )}
          </DonutChart>
        </View>

        {/* Leyenda de la categoría seleccionada: dot + nombre + monto */}
        {selected != null && (
          <Pressable
            onPress={() => setSelectedId(null)}
            className="flex-row items-center justify-center gap-2 mt-1"
            style={{ paddingVertical: 6 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: selected.color,
              }}
            />
            <AtTypography variant="bodyBold" color="#1A1F36" numberOfLines={1}>
              {selected.label}
            </AtTypography>
            <AtTypography
              variant="caption"
              color="#8892A4"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatCurrency(selected.amount)}
            </AtTypography>
          </Pressable>
        )}

        {/* Hint cuando no hay selección (mismo patrón que los demás donuts) */}
        {selected == null && (
          <View
            className="flex-row items-center justify-center"
            style={{ minHeight: 28 }}
          >
            <AtTypography variant="caption" color="#8892A4" numberOfLines={1}>
              {emptyHint}
            </AtTypography>
          </View>
        )}
      </View>
    );
  },
);

OrEmpresaDonutCard.displayName = 'OrEmpresaDonutCard';
