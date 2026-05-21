/**
 * Organism: OrTaskDetailCard
 *
 * Card grande del detalle de una tarea: header (proyecto + título + badge
 * de estado), barra de cumplimiento, grid Objetivo/Meta/Resultado y
 * sección Bloqueo / Apoyo requerido.
 */

import { AtIcon } from "@/src/components/atoms/at-icon";
import { AtProgressBar } from "@/src/components/atoms/at-progress-bar";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { View } from "@/src/tw";
import type {
  MaterialIconName,
  NexiataskTareaDetalle,
} from "@/src/types/nexiatask.types";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";

interface OrTaskDetailCardProps {
  tarea: NexiataskTareaDetalle;
}

function isCompletedState(estado: string): boolean {
  return /complet/i.test(estado);
}

// Verdes de marca: claro #8DC549 → oscuro #294316. Mismo par en chip
// (diagonal) y barra (horizontal) para que se lean como una sola familia.
const GREEN_LIGHT = "#8DC549";
const GREEN_DARK = "#294316";
const STATE_GRADIENT: readonly [string, string] = [
  GREEN_LIGHT,
  GREEN_DARK,
] as const;
const PROGRESS_GRADIENT: readonly [string, string] = [
  GREEN_DARK,
  GREEN_LIGHT,
] as const;

export const OrTaskDetailCard = memo<OrTaskDetailCardProps>(({ tarea }) => {
  const completed = isCompletedState(tarea.estado);
  const stateLabel = completed ? "Completado" : tarea.estado;
  const stateColors = STATE_GRADIENT;
  const pct = Number.isFinite(tarea.cumplimientoPct)
    ? tarea.cumplimientoPct
    : 0;

  return (
    <View
      className="gap-4 bg-bg-card mx-4 p-4 rounded-lg"
      style={{
        borderCurve: "continuous",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <AtTypography variant="bodyBold" color="#1A1F36">
        {tarea.departamentoNombre || "Sin Departamento"}
      </AtTypography>

      <View className="flex-row justify-between items-center gap-3">
        <View className="flex-row flex-1 items-center gap-2">
          <AtIcon name="check-circle" size={18} color="#5B82E6" />
          <AtTypography variant="bodyBold" color="#1A1F36" numberOfLines={2}>
            {tarea.titulo}
          </AtTypography>
        </View>
        <LinearGradient
          colors={stateColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            borderRadius: 999,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.12)",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
          }}
        >
          <AtTypography variant="captionBold" color="#FFFFFF">
            {stateLabel}
          </AtTypography>
        </LinearGradient>
      </View>

      <View className="gap-2">
        <View className="flex-row justify-between">
          <AtTypography variant="caption" color="#4A5568">
            Cumplimiento
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            {Math.round(pct)}%
          </AtTypography>
        </View>
        <AtProgressBar
          progress={pct / 100}
          colors={PROGRESS_GRADIENT}
          height={8}
        />
      </View>

      <View
        className="gap-3 p-3 rounded-md"
        style={{
          backgroundColor: "#FAFBFC",
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
        }}
      >
        <View className="flex-row gap-3">
          <DetailField
            iconName="adjust"
            iconColor="#1C1B1F"
            label="Objetivo"
            value={tarea.objetivo || "—"}
          />
          <DetailField
            iconName="flag"
            iconColor="#1C1B1F"
            label="Meta"
            value={tarea.meta || "—"}
          />
        </View>

        <View
          className="h-px"
          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
        />

        <DetailField
          iconName="search"
          iconColor="#1C1B1F"
          label="Resultado"
          value={tarea.resultado || "—"}
        />

        <View
          className="h-px"
          style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
        />

        <View className="flex-row gap-3">
          <DetailField
            iconName="error-outline"
            iconColor="#E53E3E"
            labelColor="#E53E3E"
            label="Bloqueo"
            value={tarea.bloqueo || "—"}
          />
          <DetailField
            iconName="handshake"
            iconColor="#0C2B78"
            labelColor="#0C2B78"
            label="Apoyo requerido"
            value={tarea.apoyoRequerido || "—"}
          />
        </View>
      </View>
    </View>
  );
});

OrTaskDetailCard.displayName = "OrTaskDetailCard";

interface DetailFieldProps {
  iconName: MaterialIconName;
  iconColor: string;
  label: string;
  value: string;
  labelColor?: string;
}

const DetailField = memo<DetailFieldProps>(
  ({ iconName, iconColor, label, value, labelColor = "#1A1F36" }) => {
    return (
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center gap-2">
          <AtIcon name={iconName} size={18} color={iconColor} />
          <AtTypography variant="h3" color={labelColor}>
            {label}
          </AtTypography>
        </View>
        <AtTypography variant="body" color="#4A5568">
          {value}
        </AtTypography>
      </View>
    );
  },
);
DetailField.displayName = "DetailField";
