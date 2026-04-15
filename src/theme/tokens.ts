/**
 * Design Tokens — Single Source of Truth
 *
 * EXTENSIÓN: Cuando recibas la paleta completa del equipo de diseño,
 * agrega colores aquí. Todos los componentes los consumirán automáticamente.
 *
 * Para agregar gradientes: ver src/theme/gradients.ts
 */
export const tokens = {
  color: {
    // Superficie
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F7',
      tertiary: '#EBEBF0',
      card: '#FFFFFF',
      cardElevated: '#FAFBFC',
    },
    // Navy oscuro del mockup para headers/titulos
    ink: {
      primary: '#1A1F36',
      secondary: '#4A5568',
      tertiary: '#8892A4',
      inverse: '#FFFFFF',
    },
    // Accent — Naranja ámbar del mockup
    accent: {
      primary: '#E8952E',
      secondary: '#F6AD55',
      muted: '#FEEBC8',
    },
    // Semántico
    semantic: {
      positive: '#38A169',
      positiveLight: '#C6F6D5',
      negative: '#E53E3E',
      negativeLight: '#FED7D7',
      warning: '#DD6B20',
      info: '#3182CE',
    },
    // Gráficos — Paleta del mockup (azules/navys/naranjas)
    chart: [
      '#1A2B6D',
      '#2D4BA0',
      '#4A7FD4',
      '#E8952E',
      '#F6AD55',
      '#A0AEC0',
      '#48BB78',
      '#ED64A6',
    ] as const,
    // Bordes
    border: {
      default: 'rgba(0, 0, 0, 0.08)',
      subtle: 'rgba(0, 0, 0, 0.04)',
      emphasis: 'rgba(0, 0, 0, 0.15)',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },

  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    bodyBold: { fontSize: 15, fontWeight: '600' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    captionBold: { fontSize: 13, fontWeight: '600' as const },
    metric: {
      fontSize: 32,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums'] as const,
    },
    metricSmall: {
      fontSize: 20,
      fontWeight: '700' as const,
      fontVariant: ['tabular-nums'] as const,
    },
  },
} as const;

export type TokenColors = typeof tokens.color;
export type TokenSpacing = keyof typeof tokens.spacing;
