import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlConsolidadoClientCard } from '@/src/components/molecules/ml-consolidado-client-card';
import { useConsolidadoClients } from '@/src/hooks/queries/use-consolidado-clients';
import type { ConsolidadoCategoryId } from '@/src/types/domain.types';
import { PERIOD_LABELS } from '@/src/utils/date';
import { useFiltersStore } from '@/src/stores/filters.store';

const AMOUNT_LABEL_BY_CATEGORY: Record<ConsolidadoCategoryId, string> = {
  ingresos: 'Ingresos',
  costos: 'Costos',
  gastos: 'Gastos',
  utilidad: 'Utilidad',
  egresos: 'Egresos',
};

interface OrConsolidadoClientListProps {
  categoryId: ConsolidadoCategoryId;
  onClientPress?: (clientId: string) => void;
}

export const OrConsolidadoClientList = memo<OrConsolidadoClientListProps>(
  ({ categoryId, onClientPress }) => {
    const { data, isLoading } = useConsolidadoClients(categoryId);
    const periodKey = useFiltersStore((s) => s.activePeriodKey);
    const amountLabel = AMOUNT_LABEL_BY_CATEGORY[categoryId];

    if (isLoading || !data) {
      return (
        <View className="gap-2 mx-4">
          {[0, 1, 2, 3].map((i) => (
            <AtSkeleton key={i} width="100%" height={64} borderRadius={14} />
          ))}
        </View>
      );
    }

    return (
      <View className="gap-2">
        <View className="flex-row justify-between items-center px-4">
          <View className="flex-row items-baseline gap-1">
            <AtTypography variant="bodyBold">Clientes</AtTypography>
            <AtTypography variant="caption" color="#8892A4">
              ({data.length})
            </AtTypography>
          </View>
          <View
            className="flex-row items-center gap-1 bg-bg-card px-3 py-1.5 rounded-full"
            style={{ borderCurve: 'continuous' }}
          >
            <AtTypography variant="captionBold">
              {PERIOD_LABELS[periodKey]} {'\u25BE'}
            </AtTypography>
          </View>
        </View>
        <View className="gap-2">
          {data.map((client) => (
            <MlConsolidadoClientCard
              key={client.id}
              name={client.name}
              amountLabel={amountLabel}
              amount={client.amount}
              deltaPercent={client.deltaPercent}
              onPress={() => onClientPress?.(client.id)}
            />
          ))}
        </View>
      </View>
    );
  },
);

OrConsolidadoClientList.displayName = 'OrConsolidadoClientList';
