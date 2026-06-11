/**
 * Molecule: MlCentroCostoCard
 *
 * Sub-card gris que aparece al desplegar una EMPRESA en el Informe
 * Presupuesto. Muestra el CENTRO DE COSTOS y una rejilla de 3 columnas ×
 * 2 filas: Proyectado / Ejecutado / Concepto y Categoría / Porcentaje /
 * Comentario.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { formatMoney2 } from '@/src/utils/currency';
import { formatNumber } from '@/src/utils/number';
import type { PresupuestoCentroCosto } from '@/src/types/presupuesto.types';

interface MlCentroCostoCardProps {
  centro: PresupuestoCentroCosto;
}

const LABEL_COLOR = '#1A1F36';
const VALUE_COLOR = '#5B7BBF';
const NAME_COLOR = '#2A4DA8';

const Field = memo<{ label: string; value: string }>(({ label, value }) => (
  <View className="flex-1 gap-0.5">
    <AtTypography variant="captionBold" color={LABEL_COLOR}>
      {label}
    </AtTypography>
    <AtTypography variant="caption" color={VALUE_COLOR} numberOfLines={3}>
      {value}
    </AtTypography>
  </View>
));
Field.displayName = 'CentroCostoField';

export const MlCentroCostoCard = memo<MlCentroCostoCardProps>(({ centro }) => {
  return (
    <View
      className="gap-3 p-3 rounded-lg"
      style={{
        backgroundColor: '#F4F6F8',
        borderCurve: 'continuous',
      }}
    >
      <View className="gap-0.5">
        <AtTypography variant="captionBold" color={LABEL_COLOR}>
          Centro de costos
        </AtTypography>
        <AtTypography variant="bodyBold" color={NAME_COLOR}>
          {centro.centroCostos}
        </AtTypography>
      </View>

      <View className="h-px" style={{ backgroundColor: 'rgba(0,0,0,0.08)' }} />

      <View className="flex-row gap-3">
        <Field label="Proyectado" value={formatMoney2(centro.proyectado)} />
        <Field label="Ejecutado" value={formatMoney2(centro.ejecutado)} />
        <Field label="Concepto" value={centro.concepto || '—'} />
      </View>

      <View className="flex-row gap-3">
        <Field label="Categoría" value={centro.categoria || '—'} />
        <Field
          label="Porcentaje"
          value={`${formatNumber(centro.porcentajeEje, 2)}%`}
        />
        <Field label="Comentario" value={centro.comentario || '—'} />
      </View>
    </View>
  );
});

MlCentroCostoCard.displayName = 'MlCentroCostoCard';
