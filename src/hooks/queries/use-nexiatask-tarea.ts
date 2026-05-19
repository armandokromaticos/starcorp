/**
 * useNexiataskTarea
 *
 * Detalle de una tarea + avances históricos. El histórico hoy viene
 * del mock — backend pendiente de exponer /tareas/{id}/historico.
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { fetchTareaDetalle } from '@/src/services/nexiatask.service';

export function useNexiataskTarea(tareaId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.nexiataskTarea(tareaId ?? ''),
    queryFn: () => fetchTareaDetalle(tareaId!),
    enabled: !!tareaId,
    staleTime: 5 * 60 * 1000,
  });
}
