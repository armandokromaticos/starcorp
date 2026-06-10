/**
 * Organism: OrTareasAccordionList
 *
 * Lista vertical de acordeones — uno por TAREA del departamento
 * seleccionado, con sus avances semanales (subtareas) dentro. Tap en un
 * avance navega al single de la tarea (/reportes/[taskId]).
 *
 * El carrusel superior decide qué departamento se muestra; este organism
 * solo recibe las tareas de ese departamento.
 */

import React, { memo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { MlSubtareaRow } from '@/src/components/molecules/ml-subtarea-row';
import type { NexiataskTareaConAvances } from '@/src/types/nexiatask.types';

const NAVY_BG = '#0F1B4A';

interface OrTareasAccordionListProps {
  tareas: NexiataskTareaConAvances[];
  /** Navega al single de la tarea al tocar uno de sus avances. */
  onAvancePress?: (tareaId: string) => void;
}

export const OrTareasAccordionList = memo<OrTareasAccordionListProps>(
  ({ tareas, onAvancePress }) => {
    return (
      <View className="gap-3 px-4">
        {tareas.map((t, idx) => (
          <TareaAccordion
            key={t.id}
            tarea={t}
            openByDefault={idx === 0}
            onAvancePress={onAvancePress}
          />
        ))}
      </View>
    );
  },
);

OrTareasAccordionList.displayName = 'OrTareasAccordionList';

interface TareaAccordionProps {
  tarea: NexiataskTareaConAvances;
  openByDefault: boolean;
  onAvancePress?: (tareaId: string) => void;
}

const TareaAccordion = memo<TareaAccordionProps>(
  ({ tarea, openByDefault, onAvancePress }) => {
    const [open, setOpen] = useState(openByDefault);

    const count = tarea.totalAvances || tarea.avances.length;
    const countLabel = `${count} ${count === 1 ? 'avance' : 'avances'}`;

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
          className="flex-row items-center justify-between px-4 py-3.5 gap-2"
          accessibilityRole="button"
          accessibilityLabel={`${tarea.titulo}, ${countLabel}`}
          accessibilityState={{ expanded: open }}
        >
          <View className="flex-row items-center gap-2 flex-1">
            <AtIcon name="check-circle" size={18} color="#5B82E6" />
            <AtTypography
              variant="bodyBold"
              color="#FFFFFF"
              numberOfLines={2}
              className="flex-1"
            >
              {tarea.titulo}
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
          <View className="gap-3 px-4 pb-4">
            {tarea.avances.length === 0 ? (
              <AtTypography variant="caption" color="#8FA0D6">
                Esta tarea aún no tiene avances registrados.
              </AtTypography>
            ) : (
              tarea.avances.map((a) => (
                <MlSubtareaRow
                  key={a.id}
                  avance={a}
                  onPress={() => onAvancePress?.(tarea.id)}
                />
              ))
            )}
          </View>
        )}
      </View>
    );
  },
);

TareaAccordion.displayName = 'TareaAccordion';
