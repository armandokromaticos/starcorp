/**
 * Organism: OrRecentReportsSection
 *
 * "Reportes más recientes" del dashboard — lista vertical de
 * departamentos → proyectos → tareas (alimentada por NexiaTask).
 *
 * Comparte source of truth y componentes con la pantalla /reportes:
 * usa el mismo hook (useNexiataskResponsibilities) y la misma fila
 * de tarea (MlTaskRow). Tap en una tarea navega a /reportes/[taskId].
 */

import React, { memo, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlTaskRow } from '@/src/components/molecules/ml-task-row';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { useNexiataskResponsibilities } from '@/src/hooks/queries/use-nexiatask-responsibilities';
import type {
  NexiataskDepartamento,
  NexiataskTarea,
} from '@/src/types/nexiatask.types';

const CARD_BG = '#1C224D';
const CARD_RADIUS = 8;
const MAX_DEPARTAMENTOS = 3;
const MAX_TAREAS_POR_DEPTO = 4;

interface DeptoPreview {
  id: string;
  nombre: string;
  icon: NexiataskDepartamento['icon'];
  tareas: NexiataskTarea[];
  totalTareas: number;
}

function buildPreview(
  departamentos: readonly NexiataskDepartamento[],
): DeptoPreview[] {
  return departamentos.slice(0, MAX_DEPARTAMENTOS).map((dept) => {
    const allTareas = dept.proyectos.flatMap((p) => p.tareas);
    return {
      id: dept.id,
      nombre: dept.nombre,
      icon: dept.icon,
      tareas: allTareas.slice(0, MAX_TAREAS_POR_DEPTO),
      totalTareas: allTareas.length,
    };
  });
}

export const OrRecentReportsSection = memo(() => {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } =
    useNexiataskResponsibilities();
  const previews = useMemo(
    () => buildPreview(data?.departamentos ?? []),
    [data],
  );

  const handleTareaPress = (tareaId: string) => {
    router.push(`/(tabs)/reportes/${tareaId}` as never);
  };

  return (
    <View className="gap-3">
      <View className="px-4">
        <AtTypography variant="h2">Reportes recientes</AtTypography>
      </View>

      {isLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={140} />
          <AtSkeleton width="100%" height={140} />
        </View>
      ) : isError ? (
        <View className="px-4">
          <MlEmptyState
            icon="cloud-off"
            title="No pudimos cargar los reportes"
            description="Revisa tu conexión o vuelve a intentarlo en unos segundos."
            action={{
              label: isRefetching ? 'Reintentando…' : 'Reintentar',
              onPress: () => refetch(),
            }}
          />
        </View>
      ) : previews.length === 0 ? (
        <View className="px-4">
          <MlEmptyState
            icon="assignment"
            title="Sin reportes esta semana"
            description="Aún no se registran tareas para los departamentos."
          />
        </View>
      ) : (
        <View className="gap-4 px-4">
          {previews.map((preview) => (
            <DepartmentCard
              key={preview.id}
              preview={preview}
              onTareaPress={handleTareaPress}
            />
          ))}
        </View>
      )}
    </View>
  );
});
OrRecentReportsSection.displayName = 'OrRecentReportsSection';

interface DepartmentCardProps {
  preview: DeptoPreview;
  onTareaPress: (tareaId: string) => void;
}

const DepartmentCard = memo<DepartmentCardProps>(
  ({ preview, onTareaPress }) => {
    const shown = preview.tareas.length;
    const total = preview.totalTareas;
    const countLabel =
      total > shown
        ? `${shown} de ${total} tareas`
        : `${shown} ${shown === 1 ? 'Tarea' : 'Tareas'}`;

    return (
      <View
        className="p-4 gap-3"
        style={{
          backgroundColor: CARD_BG,
          borderRadius: CARD_RADIUS,
          borderCurve: 'continuous',
          boxShadow: '0 4px 12px rgba(15, 27, 74, 0.18)',
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2 flex-1">
            <AtIcon name={preview.icon} size={18} color="#FFFFFF" />
            <AtTypography
              variant="bodyBold"
              color="#FFFFFF"
              numberOfLines={1}
            >
              {preview.nombre}
            </AtTypography>
          </View>
          <AtTypography variant="caption" color="#8FA0D6">
            {countLabel}
          </AtTypography>
        </View>

        <View className="gap-4">
          {preview.tareas.map((tarea) => (
            <MlTaskRow
              key={tarea.id}
              tarea={tarea}
              onPress={() => onTareaPress(tarea.id)}
            />
          ))}
        </View>
      </View>
    );
  },
);
DepartmentCard.displayName = 'DepartmentCard';
