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
  // Botón azul intermedio — vertical, claro (top) → oscuro (bottom)
  buttonBlue: {
    colors: ['#1938A5', '#04113F'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

export type GradientName = keyof typeof gradients;

/**
 * Paleta de gradientes para barras de gráficos (ingresos / costos / egresos / terceros).
 * Se cicla por índice. Direccion vertical (top claro → bottom oscuro).
 */
export const BAR_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#215EF7', '#0F2674'], // deep navy
  ['#3B82F6', '#1E3A8A'], // azure
  ['#14B8A6', '#0E7490'], // teal
  ['#D9E021', '#6B8E23'], // lime
  ['#F6AD55', '#E8952E'], // amber
];

/**
 * Paleta de "segmentos": colores planos de las rodajas de los donuts de
 * informes (cartera, asociados) y, para unificar el diseño, también de los
 * donuts de terceros en gastos / costos administrativos. El DonutChart
 * oscurece cada color automáticamente para dar profundidad, así que aquí
 * solo viven los tonos base. Se cicla por índice.
 */
export const SEGMENT_PALETTE: readonly string[] = [
  '#9B2C2C', // wine
  '#1A2B6D', // navy
  '#0E7490', // teal
  '#65A30D', // lime
  '#D9E021', // yellow-lime
  '#3B82F6', // azure
  '#0B1F4A', // dark navy
  '#F6AD55', // amber
  '#7C3AED', // purple
  '#DC2626', // red
  '#059669', // emerald
  '#A16207', // ochre
];

/** Color del bucket "Otros" en los donuts de segmentos (gris neutro). */
export const OTROS_SEGMENT_COLOR = '#6B7280';

/**
 * Paleta de 8 gradientes para clientes (C1–C8).
 * Usada en or-top-clients-section (legend swatches) y en el bar chart
 * de or-cost-groups-chart-card. Dirección vertical (top claro → bottom oscuro).
 */
export const CLIENT_LEGEND_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#F0A968', '#C67A3C'], // C1 orange
  ['#1F2A6B', '#0A0E2E'], // C2 dark navy
  ['#6B8FC9', '#3D5A8A'], // C3 sky blue
  ['#D4E061', '#8B9B3A'], // C4 lime
  ['#7BA854', '#4A6B2E'], // C5 green
  ['#3C5C5C', '#1A2E2E'], // C6 teal
  ['#3A5BC4', '#1F3580'], // C7 royal blue
  ['#A8527A', '#5C2A47'], // C8 magenta
];
