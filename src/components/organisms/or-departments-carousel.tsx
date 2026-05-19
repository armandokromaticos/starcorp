/**
 * Organism: OrDepartmentsCarousel
 *
 * Carrusel horizontal de MlDepartmentCard. El depto seleccionado filtra
 * los proyectos mostrados debajo (OrResponsibilitiesList).
 */

import React, { memo } from 'react';
import { ScrollView } from '@/src/tw';
import { MlDepartmentCard } from '@/src/components/molecules/ml-department-card';
import type { NexiataskDepartamento } from '@/src/types/nexiatask.types';

interface OrDepartmentsCarouselProps {
  departamentos: NexiataskDepartamento[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export const OrDepartmentsCarousel = memo<OrDepartmentsCarouselProps>(
  ({ departamentos, selectedId, onSelect }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
      >
        {departamentos.map((d) => (
          <MlDepartmentCard
            key={d.id}
            nombre={d.nombre}
            responsable={d.responsable}
            icon={d.icon}
            selected={selectedId === d.id}
            onPress={() => onSelect?.(d.id)}
          />
        ))}
      </ScrollView>
    );
  },
);

OrDepartmentsCarousel.displayName = 'OrDepartmentsCarousel';
