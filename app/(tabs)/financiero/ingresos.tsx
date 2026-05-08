import React from 'react';
import { OrQBSectionDetail } from '@/src/components/organisms/or-qb-section-detail';

export default function FinancieroIngresosScreen() {
  return (
    <OrQBSectionDetail
      group="Income"
      breadcrumbLabel="Ingresos"
      defaultIcon="attach-money"
    />
  );
}
