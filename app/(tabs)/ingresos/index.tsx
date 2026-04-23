import React from 'react';
import { router } from 'expo-router';
import { TmConsolidatedList } from '@/src/components/templates/tm-consolidated-list';
import { OrConsolidadoClientList } from '@/src/components/organisms/or-consolidado-client-list';

export default function IngresosConsolidadoScreen() {
  return (
    <TmConsolidatedList
      breadcrumbs={['Ingresos consolidado']}
      showFilter={false}
      onBack={() => router.back()}
    >
      <OrConsolidadoClientList
        categoryId="ingresos"
        onClientPress={(clientId) =>
          router.push(`/ingresos/${clientId}` as Parameters<typeof router.push>[0])
        }
      />
    </TmConsolidatedList>
  );
}
