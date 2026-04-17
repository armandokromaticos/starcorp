/**
 * Organism: OrTopClientsSection
 *
 * "Top 8 clientes (Mayor ingreso)" section.
 * Card container with client list + donut chart; CTA button sits below
 * the card aligned to the right and navigates to /clientes.
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
    const [donutSize, setDonutSize] = useState(0);

    const selectedClient = data?.clients[selectedIndex];

    if (isLoading || !data) {
      return (
        <View className="px-4 gap-3">
          <AtSkeleton width={240} height={22} />
          <AtSkeleton width="100%" height={360} borderRadius={16} />
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
          <AtStatusBadge label={periodLabel} variant="gradient" size="md" />
        </View>

        {/* Card wrapping list + donut */}
        <View
          className="bg-bg-card mx-4 rounded-lg p-4"
          style={{
            borderCurve: 'continuous',
            boxShadow:
              '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <View className="flex-row gap-4">
            <View className="flex-1 gap-0.5">
              {data.clients.map((client, i) => (
                <MlClientRow
                  key={client.id}
                  name={client.name}
                  color={client.color}
                  selected={selectedIndex === i}
                  onPress={() => setSelectedIndex(i)}
                />
              ))}
            </View>

            <View
              className="flex-1 items-center justify-center gap-3"
              onLayout={(e) =>
                setDonutSize(Math.min(180, e.nativeEvent.layout.width))
              }
            >
              {selectedClient && (
                <View className="items-center gap-1">
                  <AtTypography variant="bodyBold">
                    {selectedClient.name}
                  </AtTypography>
                  <AtMetricValue value={selectedClient.revenue} size="md" />
                  <AtDeltaIndicator
                    value={selectedClient.deltaPercent}
                    size="sm"
                    appearance="dark"
                  />
                </View>
              )}

              <View
                style={{
                  height: 1,
                  alignSelf: 'stretch',
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }}
              />

              {donutSize > 0 && (
                <DonutChart
                  data={data.chartData}
                  size={donutSize}
                  innerRadius={0.6}
                  padAngle={2}
                  ringSplit={0.22}
                  centerBackground={{ from: '#2B3B7A', to: '#050C25' }}
                >
                  <AtTypography
                    variant="metricSmall"
                    color="#FFFFFF"
                    selectable
                  >
                    {formatCurrency(data.total, { compact: true })}
                  </AtTypography>
                  <AtTypography
                    variant="caption"
                    color="rgba(255,255,255,0.75)"
                  >
                    Total
                  </AtTypography>
                </DonutChart>
              )}
            </View>
          </View>
        </View>

        {/* Footer CTA — right aligned, navigates to /clientes */}
        <View className="items-end px-4 pb-2">
          <Pressable
            onPress={onViewClients}
            className="bg-navy px-6 py-3 rounded-lg"
            style={{
              borderCurve: 'continuous',
              boxShadow: '0 2px 6px rgba(15, 27, 74, 0.25)',
            }}
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
