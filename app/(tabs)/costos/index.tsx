import React from 'react';
import { router } from 'expo-router';
import { TmConsolidatedList } from '@/src/components/templates/tm-consolidated-list';
import { OrConsolidadoClientList } from '@/src/components/organisms/or-consolidado-client-list';

export default function CostosConsolidadoScreen() {
  return (
    <TmConsolidatedList
      breadcrumbs={['Costos consolidado']}
      showFilter={false}
      onBack={() => router.back()}
    >
      <OrConsolidadoClientList
        categoryId="costos"
        onClientPress={(clientId) =>
          router.push(`/costos/${clientId}` as Parameters<typeof router.push>[0])
        }
      />
    </TmConsolidatedList>
  );
}
