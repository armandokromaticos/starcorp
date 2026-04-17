import { tokens } from './tokens';

/**
 * Gradientes del design system.
 * Agregar gradientes adicionales aquí cuando estén disponibles.
 *
 * Uso con react-native-svg LinearGradient dentro de victory-native charts,
 * o con expo experimental_backgroundImage para Views.
 */
export const gradients = {
  // Cards de categoría (del mockup — navy oscuro)
  cardNavy: {
    colors: ['#1A2B6D', '#0F1B4A'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // Gráfico de área principal
  chartArea: {
    colors: [`${tokens.color.chart[0]}40`, `${tokens.color.chart[0]}05`] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Brand navy (iconos, acentos navy) — vertical, claro → oscuro
  brandNavy: {
    colors: ['#20307E', '#0A1537'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  // Brand orange (icono "Consolidado", acentos cálidos) — vertical, claro → oscuro
  brandOrange: {
    colors: ['#F2C87A', '#FFB74A', '#DF6434'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

export type GradientName = keyof typeof gradients;
