import React from 'react';
import { router } from 'expo-router';
import { View } from '@/src/tw';
import { TmConsolidatedList } from '@/src/components/templates/tm-consolidated-list';
import { OrConsolidadoClientList } from '@/src/components/organisms/or-consolidado-client-list';
import { OrExpenseCentralCard } from '@/src/components/organisms/or-expense-central-card';
import { useExpenseCentral } from '@/src/hooks/queries/use-expense-central';

export default function GastosConsolidadoScreen() {
  const { data } = useExpenseCentral();

  return (
    <TmConsolidatedList
      breadcrumbs={['Gastos consolidado']}
      showFilter={false}
      onBack={() => router.back()}
    >
      <View className="gap-3">
        {data && (
          <OrExpenseCentralCard
            total={data.total}
            deltaPercent={data.deltaPercent}
          />
        )}
        <OrConsolidadoClientList
          categoryId="gastos"
          onClientPress={(clientId) =>
            router.push(`/gastos/${clientId}` as Parameters<typeof router.push>[0])
          }
        />
      </View>
    </TmConsolidatedList>
  );
}
