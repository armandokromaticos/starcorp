/**
 * Organism: OrTopClientsSection
 *
 * "Top 8 clientes (Mayor ingreso)" section from mockup.
 * Client list on left + Donut chart on right.
 * Fixed: uses CSS tokens instead of hardcoded navys.
 * Migrated to NativeWind + AtTypography atoms.
 */

import React, { memo, useState } from 'react';
import { View, Pressable } from '@/src/tw';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { MlClientRow } from '@/src/components/molecules/ml-client-row';
import { DonutChart } from '@/src/components/charts/donut-chart';
import { useTopClients } from '@/src/hooks/queries/use-top-clients';
import { formatCurrency } from '@/src/utils/currency';

interface OrTopClientsSectionProps {
  periodLabel?: string;
  onViewClients?: () => void;
}

export const OrTopClientsSection = memo<OrTopClientsSectionProps>(
  ({ periodLabel = 'Hoy', onViewClients }) => {
    const { data, isLoading } = useTopClients(8);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedClient = data?.clients[selectedIndex];

    if (isLoading || !data) {
      return (
        <View className="px-4 gap-3">
          <AtSkeleton width={240} height={22} />
          {Array.from({ length: 4 }).map((_, i) => (
            <AtSkeleton key={i} width="100%" height={36} />
          ))}
        </View>
      );
    }

    return (
      <View className="gap-4">
        {/* Section header */}
        <View className="flex-row justify-between items-center px-4">
          <AtTypography variant="h3">
            Top 8 clientes (Mayor ingreso)
          </AtTypography>
          <AtStatusBadge label={periodLabel} variant="accent" size="sm" />
        </View>

        {/* Content: List + Chart */}
        <View className="flex-row px-4 gap-4">
          <View className="flex-1 gap-0.5">
            {data.clients.map((client, i) => (
              <MlClientRow
                key={client.id}
                name={client.name}
                color={client.color}
                revenue={client.revenue}
                deltaPercent={client.deltaPercent}
                selected={selectedIndex === i}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </View>

          <View className="flex-1 items-center gap-3">
            {selectedClient && (
              <View className="items-center gap-1">
                <AtTypography variant="bodyBold">
                  {selectedClient.name}
                </AtTypography>
                <AtMetricValue value={selectedClient.revenue} size="md" />
                <AtDeltaIndicator value={selectedClient.deltaPercent} size="sm" />
              </View>
            )}

            <DonutChart
              data={data.chartData}
              size={180}
              innerRadius={0.6}
              padAngle={2}
            >
              <AtTypography variant="metricSmall" selectable>
                {formatCurrency(data.total, { compact: true })}
              </AtTypography>
              <AtTypography variant="caption" color="#8892A4">
                Total
              </AtTypography>
            </DonutChart>
          </View>
        </View>

        {/* Footer CTA */}
        <View className="items-center pb-4">
          <Pressable
            onPress={onViewClients}
            className="bg-navy px-6 py-3 rounded-full"
            style={{ borderCurve: 'continuous' }}
          >
            <AtTypography variant="captionBold" color="#FFFFFF">
              Ver clientes
            </AtTypography>
          </Pressable>
        </View>
      </View>
    );
  },
);

OrTopClientsSection.displayName = 'OrTopClientsSection';
