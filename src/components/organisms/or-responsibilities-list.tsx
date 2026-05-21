/**
 * Organism: OrResponsibilitiesList
 *
 * Lista vertical de acordeones — uno por departamento, con TODAS las
 * tareas del depto dentro. El carrusel superior controla cuál abre:
 * cambiar de tarjeta cierra los demás y abre el seleccionado.
 *
 * (Antes el acordeón era por "proyecto" — chunks artificiales de 4
 * tareas con título hardcoded "Desarrollo del área comercial". Se
 * quita hasta que backend exponga `proyecto_id` real.)
 */

import React, { memo, useEffect, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { MlTaskRow } from '@/src/components/molecules/ml-task-row';
import type {
  NexiataskDepartamento,
  NexiataskTarea,
} from '@/src/types/nexiatask.types';

const NAVY_BG = '#0F1B4A';

interface OrResponsibilitiesListProps {
  departamentos: NexiataskDepartamento[];
  /** Acordeón que arranca abierto (default: el primero). */
  selectedId?: string;
  onTareaPress?: (tareaId: string) => void;
}

export const OrResponsibilitiesList = memo<OrResponsibilitiesListProps>(
  ({ departamentos, selectedId, onTareaPress }) => {
    return (
      <View className="gap-3 px-4">
        {departamentos.map((d, idx) => {
          const tareas = d.proyectos.flatMap((p) => p.tareas);
          const openByDefault = selectedId
            ? d.id === selectedId
            : idx === 0;
          return (
            <DepartmentAccordion
              key={d.id}
              departamento={d}
              tareas={tareas}
              openByDefault={openByDefault}
              onTareaPress={onTareaPress}
            />
          );
        })}
      </View>
    );
  },
);

OrResponsibilitiesList.displayName = 'OrResponsibilitiesList';

interface DepartmentAccordionProps {
  departamento: NexiataskDepartamento;
  tareas: NexiataskTarea[];
  openByDefault: boolean;
  onTareaPress?: (tareaId: string) => void;
}

const DepartmentAccordion = memo<DepartmentAccordionProps>(
  ({ departamento, tareas, openByDefault, onTareaPress }) => {
    const [open, setOpen] = useState(openByDefault);

    // El carrusel puede cambiar la selección después del primer render —
    // sincronizamos para que el acordeón seleccionado se abra y los demás
    // se cierren. Si el usuario abre uno manualmente, mantiene su estado
    // hasta el próximo cambio del carrusel.
    useEffect(() => {
      setOpen(openByDefault);
    }, [openByDefault]);

    const taskCount = tareas.length;
    const countLabel = `${taskCount} ${taskCount === 1 ? 'tarea' : 'tareas'}`;

    return (
      <View
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: NAVY_BG,
          borderCurve: 'continuous',
          boxShadow: '0 4px 12px rgba(15, 27, 74, 0.18)',
        }}
      >
        <Pressable
          onPress={() => setOpen((o) => !o)}
          className="flex-row items-center justify-between px-4 py-3.5"
          accessibilityRole="button"
          accessibilityLabel={`${departamento.nombre}, ${countLabel}`}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <AtIcon name={departamento.icon} size={18} color="#FFFFFF" />
            <AtTypography
              variant="bodyBold"
              color="#FFFFFF"
              numberOfLines={1}
            >
              {departamento.nombre}
            </AtTypography>
          </View>
          <View className="flex-row items-center gap-2">
            <AtTypography variant="caption" color="#8FA0D6">
              {countLabel}
            </AtTypography>
            <AtIcon
              name={open ? 'expand-less' : 'expand-more'}
              size={20}
              color="#FFFFFF"
            />
          </View>
        </Pressable>

        {open && (
          <View className="gap-4 px-4 pb-4">
            {taskCount === 0 ? (
              <AtTypography variant="caption" color="#8FA0D6">
                Este departamento aún no tiene tareas registradas esta semana.
              </AtTypography>
            ) : (
              tareas.map((t) => (
                <MlTaskRow
                  key={t.id}
                  tarea={t}
                  onPress={() => onTareaPress?.(t.id)}
                />
              ))
            )}
          </View>
        )}
      </View>
    );
  },
);

DepartmentAccordion.displayName = 'DepartmentAccordion';
