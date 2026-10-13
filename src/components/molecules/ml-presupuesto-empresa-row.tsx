/**
 * Molecule: MlPresupuestoEmpresaRow
 *
 * Fila desplegable de una EMPRESA en el Informe Presupuesto. Header con
 * nombre + tipo y columnas Proyectado/Ejecutado; al desplegar muestra una
 * MlCentroCostoCard por cada centro de costos.
 */

import React, { memo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { MlCentroCostoCard } from '@/src/components/molecules/ml-centro-costo-card';
import { formatMoney2 } from '@/src/utils/currency';
import type { PresupuestoEmpresa } from '@/src/types/presupuesto.types';

interface MlPresupuestoEmpresaRowProps {
  empresa: PresupuestoEmpresa;
  openByDefault?: boolean;
}

const Amount = memo<{ label: string; value: number }>(({ label, value }) => (
  <View className="items-end gap-0.5" style={{ minWidth: 84 }}>
    <AtTypography variant="captionBold" color="#1A1F36">
      {label}
    </AtTypography>
    <AtTypography
      variant="caption"
      color="#4A5568"
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {formatMoney2(value)}
    </AtTypography>
  </View>
));
Amount.displayName = 'PresupuestoAmount';

export const MlPresupuestoEmpresaRow = memo<MlPresupuestoEmpresaRowProps>(
  ({ empresa, openByDefault = false }) => {
    const [open, setOpen] = useState(openByDefault);

    return (
      <View
        className="bg-bg-card rounded-lg overflow-hidden"
        style={{
          borderCurve: 'continuous',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={empresa.empresa}
          className="flex-row items-center gap-3 p-4"
        >
          <View className="flex-1 gap-0.5">
            <AtTypography variant="bodyBold" color="#1A1F36" numberOfLines={1}>
              {empresa.empresa}
            </AtTypography>
            <AtTypography variant="caption" color="#8892A4">
              {empresa.tipoLabel}
            </AtTypography>
          </View>

          <Amount label="Proyectado" value={empresa.proyectado} />
          <Amount label="Ejecutado" value={empresa.ejecutado} />

          <AtIcon
            name={open ? 'expand-less' : 'expand-more'}
            size={20}
            color="#1A1F36"
          />
        </Pressable>

        {open && empresa.centrosCosto.length > 0 && (
          <View className="gap-3 px-3 pb-3">
            {empresa.centrosCosto.map((c) => (
              <MlCentroCostoCard key={c.id} centro={c} />
            ))}
          </View>
        )}
      </View>
    );
  },
);

MlPresupuestoEmpresaRow.displayName = 'MlPresupuestoEmpresaRow';
