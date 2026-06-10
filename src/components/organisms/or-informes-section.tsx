/**
 * Organism: OrInformesSection
 *
 * Dashboard "Informes" card. Left sidebar lists report categories
 * (carteras, asociados, bancos, presupuestos, seguros, pagos). Right
 * side shows the selected category's label, total, a 12-month line
 * chart with axes, and a "Ver <categoría>" CTA pinned to the bottom.
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AreaChart } from '@/src/components/charts/area-chart';
import { BarChart } from '@/src/components/charts/bar-chart';
import { DonutChart } from '@/src/components/charts/donut-chart';
import { GaugeChart } from '@/src/components/charts/gauge-chart';
import { MlReportCategoryRow } from '@/src/components/molecules/ml-report-category-row';
import { useReports } from '@/src/hooks/queries/use-reports';
import { useCartera } from '@/src/hooks/queries/use-cartera';
import { useAsociados } from '@/src/hooks/queries/use-asociados';
import { useAsociadosTrend } from '@/src/hooks/queries/use-asociados-trend';
import { useBancos } from '@/src/hooks/queries/use-bancos';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { usePagos } from '@/src/hooks/queries/use-pagos';
import {
  AGING_BUCKETS,
  AGING_BUCKET_LABEL,
  type AgingBucket,
} from '@/src/types/cartera.types';
import { polizaStatus } from '@/src/types/seguros.types';
import {
  MONTO_BUCKET_COLOR,
  type MontoBucket,
} from '@/src/types/pagos.types';
import { formatCompact, formatNumber } from '@/src/utils/number';
import { formatCurrency } from '@/src/utils/currency';
import { tokens } from '@/src/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import {
  gradients,
  SEGMENT_PALETTE,
  OTROS_SEGMENT_COLOR,
} from '@/src/theme/gradients';

interface OrInformesSectionProps {
  title?: string;
  periodLabel?: string;
  initialSelectedId?: string;
  /** Recibe el id de la categoría seleccionada para navegar a su single. */
  onViewAll?: (reportId: string) => void;
}

const MONTHS_ES_SHORT = [
  'E',
  'F',
  'M',
  'A',
  'M',
  'J',
  'J',
  'A',
  'S',
  'O',
  'N',
  'D',
];

const MONTHS_ES_3 = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

/** Colores de las series de Asociados (mockup). */
const ASOCIADOS_CORRIENTE_COLOR = '#E89A3E';
const ASOCIADOS_HISTORICO_COLOR = '#1B2A6B';

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function compactMoney(value: number): string {
  if (value >= 1000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}

/** Rampa de severidad de aging: corriente (verde) → 91+ (rojo). */
const AGING_BUCKET_COLOR: Record<AgingBucket, string> = {
  corriente: '#3FB97A',
  '0-30': '#E89A3E',
  '31-60': '#E8803E',
  '61-90': '#E85F3E',
  '91+': '#D7443E',
};

function niceCeil(value: number): number {
  if (value <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

export const OrInformesSection = memo<OrInformesSectionProps>(
  ({
    title = 'Informes',
    periodLabel = 'Mes corriente',
    initialSelectedId,
    onViewAll,
  }) => {
    const { data, isLoading } = useReports();
    const { data: carteraData } = useCartera();
    const { data: asociadosData } = useAsociados();
    const { data: asociadosTrend } = useAsociadosTrend();
    const { data: bancosData } = useBancos();
    const { data: segurosData } = useSeguros();
    const { data: pagosData } = usePagos();
    const [selectedId, setSelectedId] = useState<string | null>(
      initialSelectedId ?? null,
    );
    const [chartWidth, setChartWidth] = useState(0);

    // Cartera real (QuickBooks AR aging): total + montos por bucket.
    const carteraAgg = useMemo(() => {
      if (!carteraData) return null;
      const buckets: Record<AgingBucket, number> = {
        corriente: 0,
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '91+': 0,
      };
      let total = 0;
      for (const client of carteraData.clients) {
        for (const b of AGING_BUCKETS) buckets[b] += client.buckets[b];
        total += client.total;
      }
      return { buckets, total };
    }, [carteraData]);

    // Asociados activos: total real (snapshot) + dos series de 12 meses.
    // Histórico = total activo por mes (trend real). Corriente = línea recta
    // de referencia en el total activo de hoy.
    const asociadosAgg = useMemo(() => {
      if (!asociadosData || !asociadosTrend) return null;
      const total = asociadosData.clients.reduce(
        (sum, c) => sum + c.employees.length,
        0,
      );
      const months = asociadosTrend.months;
      const n = months.length;
      const historico = new Array<number>(n).fill(0);
      for (const s of asociadosTrend.series) {
        for (let i = 0; i < n; i++) historico[i] += s.counts[i] ?? 0;
      }
      const corriente = new Array<number>(n).fill(total);
      const labels = months.map(
        (ym) => MONTHS_ES_3[Number(ym.slice(5, 7)) - 1] ?? ym,
      );
      return { total, historico, corriente, labels };
    }, [asociadosData, asociadosTrend]);

    // Bancos: total (totalizado) + empresas con saldo > 0 para el donut.
    const bancosAgg = useMemo(() => {
      if (!bancosData) return null;
      const empresas = bancosData.empresas
        .filter((e) => (e.balance ?? 0) > 0)
        .sort((a, b) => (b.balance ?? 0) - (a.balance ?? 0))
        .map((e, i) => ({
          id: e.id,
          name: e.name,
          balance: e.balance as number,
          color: SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
        }));
      return { total: bancosData.totalizado, empresas };
    }, [bancosData]);

    // Seguros: conteo de pólizas por estado en los 3 dominios (compañías,
    // vehículos, propiedades). El total grande = cantidad de pólizas existentes.
    const segurosAgg = useMemo(() => {
      if (!segurosData) return null;
      const today = segurosData.todayIso;
      const vigenciaFins: string[] = [
        ...segurosData.empresas.flatMap((e) =>
          e.polizas.map((p) => p.vigenciaFin),
        ),
        ...segurosData.vehiculos.map((v) => v.vigenciaFin),
        ...segurosData.propiedades.map((p) => p.vigenciaFin),
      ];
      let vencidas = 0;
      let porVencer = 0;
      for (const fin of vigenciaFins) {
        const st = polizaStatus(fin, today);
        if (st === 'vencida') vencidas += 1;
        else if (st === 'por_vencer') porVencer += 1;
      }
      return { total: vigenciaFins.length, vencidas, porVencer };
    }, [segurosData]);

    // Pagos: mini-calendario de la primera semana con pagos del mes activo
    // (Lun–Dom). El total grande = total de esa semana.
    const pagosAgg = useMemo(() => {
      if (!pagosData || pagosData.pagos.length === 0) return null;
      const totalsByDate: Record<string, number> = {};
      for (const p of pagosData.pagos) {
        totalsByDate[p.fecha] = (totalsByDate[p.fecha] ?? 0) + p.monto;
      }
      const paidDates = Object.keys(totalsByDate).sort();
      const activeMonth = paidDates[paidDates.length - 1].slice(0, 7);
      const anchor =
        paidDates.find((d) => d.startsWith(activeMonth)) ?? paidDates[0];

      // Lunes de la semana que contiene `anchor`.
      const [ay, am, ad] = anchor.split('-').map(Number);
      const base = new Date(Date.UTC(ay, am - 1, ad));
      const mondayIdx = (base.getUTCDay() + 6) % 7;
      const monday = new Date(base);
      monday.setUTCDate(base.getUTCDate() - mondayIdx);

      const days = Array.from({ length: 7 }, (_, i) => {
        const dt = new Date(monday);
        dt.setUTCDate(monday.getUTCDate() + i);
        const iso = `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(
          dt.getUTCDate(),
        )}`;
        const dayTotal = totalsByDate[iso] ?? 0;
        return {
          iso,
          day: dt.getUTCDate(),
          total: dayTotal,
          bucket:
            dayTotal > 0
              ? (pagosData.dayBuckets[iso] ?? 'medio')
              : null,
        };
      });

      const weekTotal = days.reduce((s, d) => s + d.total, 0);
      const [my, mm] = activeMonth.split('-').map(Number);
      const monthLabel = `${MONTH_NAMES_ES[mm - 1]} ${my}`;
      return { days, weekTotal, monthLabel };
    }, [pagosData]);

    useEffect(() => {
      if (!selectedId && data?.reports.length) {
        setSelectedId(data.reports[0].id);
      }
    }, [data, selectedId]);

    const selected = useMemo(() => {
      if (!data) return null;
      return data.reports.find((r) => r.id === selectedId) ?? data.reports[0];
    }, [data, selectedId]);

    const isCartera = selected?.id === 'cartera' && carteraAgg !== null;
    const isAsociados = selected?.id === 'asociados' && asociadosAgg !== null;
    const isBancos = selected?.id === 'bancos' && bancosAgg !== null;
    // Presupuesto: aún sin conexión real (mock). Seguros y Pagos: conectados.
    const isPresupuesto = selected?.id === 'presupuesto';
    const isSeguros = selected?.id === 'seguro' && segurosAgg !== null;
    const isPagos = selected?.id === 'pagos' && pagosAgg !== null;
    const displayTotal = isCartera
      ? (carteraAgg?.total ?? 0)
      : isAsociados
        ? (asociadosAgg?.total ?? 0)
        : isBancos
          ? (bancosAgg?.total ?? 0)
          : isSeguros
            ? (segurosAgg?.total ?? 0)
            : isPagos
              ? (pagosAgg?.weekTotal ?? 0)
              : (selected?.total ?? 0);
    // Conteos (asociados, seguros) se muestran como número plano, no moneda.
    const isCount = isAsociados || isSeguros;

    if (isLoading || !data || !selected) {
      return (
        <View className="px-4 gap-3">
          <AtSkeleton width={160} height={24} />
          <AtSkeleton width="100%" height={320} borderRadius={16} />
        </View>
      );
    }

    return (
      <View className="gap-4">
        <View className="flex-row justify-between items-center px-4">
          <AtTypography variant="h2">{title}</AtTypography>
          <AtStatusBadge label={periodLabel} variant="gradient" size="md" />
        </View>

        <View
          className="bg-bg-card rounded-lg mx-4 p-4 gap-4"
          style={{
            borderCurve: 'continuous',
            boxShadow:
              '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <View className="flex-row gap-3">
            <View className="gap-1" style={{ minWidth: 84 }}>
              {data.reports.map((r) => (
                <MlReportCategoryRow
                  key={r.id}
                  label={r.label}
                  icon={r.icon as React.ComponentProps<typeof MlReportCategoryRow>['icon']}
                  color={r.color}
                  selected={selected.id === r.id}
                  onPress={() => setSelectedId(r.id)}
                />
              ))}
            </View>

            <View className="flex-1 gap-2">
              <AtTypography variant="bodyBold" color="#1A1F36">
                {selected.label}
              </AtTypography>
              {isCount ? (
                <AtTypography
                  variant="metricSmall"
                  color="#1A1F36"
                  selectable
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatNumber(displayTotal)}
                </AtTypography>
              ) : (
                <AtMetricValue
                  value={displayTotal}
                  size="md"
                  currency={selected.currency}
                />
              )}

              <View
                style={{ marginTop: 8 }}
                onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
              >
                {chartWidth > 0 &&
                  (isCartera && carteraAgg ? (
                    <ReportBucketChart
                      buckets={carteraAgg.buckets}
                      width={chartWidth}
                    />
                  ) : isAsociados && asociadosAgg ? (
                    <ReportDualLineChart
                      historico={asociadosAgg.historico}
                      corriente={asociadosAgg.corriente}
                      labels={asociadosAgg.labels}
                      width={chartWidth}
                    />
                  ) : isBancos && bancosAgg ? (
                    <ReportBancosDonut
                      empresas={bancosAgg.empresas}
                      width={chartWidth}
                    />
                  ) : isPresupuesto ? (
                    <ReportGauge
                      width={chartWidth}
                      minLabel="$0 mil"
                      maxLabel="$99 mil"
                    />
                  ) : isSeguros && segurosAgg ? (
                    <ReportSegurosStats
                      total={segurosAgg.total}
                      vencidas={segurosAgg.vencidas}
                      porVencer={segurosAgg.porVencer}
                    />
                  ) : isPagos && pagosAgg ? (
                    <ReportPagosCalendar
                      days={pagosAgg.days}
                      monthLabel={pagosAgg.monthLabel}
                    />
                  ) : (
                    <ReportLineChart
                      series={selected.series}
                      width={chartWidth}
                    />
                  ))}
              </View>

              <View className="items-end mt-2">
                <Pressable
                  onPress={() => onViewAll?.(selected.id)}
                  style={{
                    borderRadius: 8,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(4, 17, 63, 0.35)',
                  }}
                >
                  <LinearGradient
                    colors={gradients.buttonBlue.colors}
                    start={gradients.buttonBlue.start}
                    end={gradients.buttonBlue.end}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AtTypography variant="captionBold" color="#FFFFFF">
                      Ver {selected.label.toLowerCase()}
                    </AtTypography>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  },
);
OrInformesSection.displayName = 'OrInformesSection';

const ReportLineChart = memo<{ series: number[]; width: number }>(
  ({ series, width }) => {
    const yAxisWidth = 28;
    const chartWidth = Math.max(40, width - yAxisWidth);
    const chartHeight = 110;

    const yMax = useMemo(() => niceCeil(Math.max(...series)), [series]);
    const yTicks = useMemo(() => [yMax, yMax / 2, 0], [yMax]);

    return (
      <View style={{ width, height: chartHeight + 22 }}>
        {/* Y-axis labels */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: chartHeight,
            width: yAxisWidth - 4,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 1,
          }}
        >
          {yTicks.map((t, i) => (
            <AtTypography key={i} variant="label" color="#8892A4">
              {t === 0 ? '0' : String(t)}
            </AtTypography>
          ))}
        </View>

        <View style={{ marginLeft: yAxisWidth, position: 'relative' }}>
          {/* Dashed grid lines */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: chartHeight,
              justifyContent: 'space-between',
            }}
          >
            {yTicks.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 1,
                  borderTopWidth: 1,
                  borderTopColor: tokens.color.border.default,
                  borderStyle: 'dashed',
                }}
              />
            ))}
          </View>

          {/* Line — navy stroke, no fill */}
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <AreaChart
              data={series}
              width={chartWidth}
              height={chartHeight}
              color="#1B2A6B"
              smooth
              strokeWidth={2.5}
              strokeOpacity={1}
              gradientId="grad-report-line"
              yMin={0}
              yMax={yMax}
              fillGradient={{
                stops: [
                  { offset: 0, color: '#1B2A6B', opacity: 0 },
                  { offset: 1, color: '#1B2A6B', opacity: 0 },
                ],
              }}
            />
          </View>

          {/* X-axis month labels */}
          <View
            style={{
              position: 'absolute',
              top: chartHeight + 4,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {MONTHS_ES_SHORT.map((m, i) => (
              <AtTypography key={i} variant="label" color="#8892A4">
                {m}
              </AtTypography>
            ))}
          </View>
        </View>
      </View>
    );
  },
);
ReportLineChart.displayName = 'ReportLineChart';

/**
 * Bar chart de aging para Cartera: una barra por bucket
 * (corriente / 0-30 / 31-60 / 61-90 / 91+), coloreada por severidad.
 */
const ReportBucketChart = memo<{
  buckets: Record<AgingBucket, number>;
  width: number;
}>(({ buckets, width }) => {
  const yAxisWidth = 36;
  const chartWidth = Math.max(40, width - yAxisWidth);
  const chartHeight = 110;

  const values = useMemo(
    () => AGING_BUCKETS.map((b) => buckets[b]),
    [buckets],
  );
  const yMax = useMemo(() => niceCeil(Math.max(...values, 0)), [values]);
  const yTicks = useMemo(() => [yMax, yMax / 2, 0], [yMax]);
  const barData = useMemo(
    () =>
      AGING_BUCKETS.map((b) => ({
        value: buckets[b],
        color: AGING_BUCKET_COLOR[b],
      })),
    [buckets],
  );

  return (
    <View style={{ width, height: chartHeight + 22 }}>
      {/* Y-axis labels */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: chartHeight,
          width: yAxisWidth - 4,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 1,
        }}
      >
        {yTicks.map((t, i) => (
          <AtTypography key={i} variant="label" color="#8892A4">
            {t === 0 ? '0' : formatCompact(t)}
          </AtTypography>
        ))}
      </View>

      <View style={{ marginLeft: yAxisWidth, position: 'relative' }}>
        {/* Dashed grid lines */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: chartHeight,
            justifyContent: 'space-between',
          }}
        >
          {yTicks.map((_, i) => (
            <View
              key={i}
              style={{
                height: 1,
                borderTopWidth: 1,
                borderTopColor: tokens.color.border.default,
                borderStyle: 'dashed',
              }}
            />
          ))}
        </View>

        {/* Bars */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <BarChart
            data={barData}
            width={chartWidth}
            height={chartHeight}
            gap={10}
          />
        </View>

        {/* X-axis bucket labels */}
        <View
          style={{
            position: 'absolute',
            top: chartHeight + 4,
            left: 0,
            right: 0,
            flexDirection: 'row',
          }}
        >
          {AGING_BUCKETS.map((b) => (
            <View key={b} style={{ flex: 1, alignItems: 'center' }}>
              <AtTypography variant="label" color="#8892A4">
                {AGING_BUCKET_LABEL[b]}
              </AtTypography>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
ReportBucketChart.displayName = 'ReportBucketChart';

/**
 * Doble línea para Asociados: Histórico (total activo por mes, navy) y
 * Corriente (línea de referencia recta en el total activo de hoy, naranja),
 * con leyenda debajo.
 */
const ReportDualLineChart = memo<{
  historico: number[];
  corriente: number[];
  labels: string[];
  width: number;
}>(({ historico, corriente, labels, width }) => {
  const yAxisWidth = 28;
  const chartWidth = Math.max(40, width - yAxisWidth);
  const chartHeight = 110;

  const yMax = useMemo(
    () => niceCeil(Math.max(1, ...historico, ...corriente)),
    [historico, corriente],
  );
  const yTicks = useMemo(() => [yMax, yMax / 2, 0], [yMax]);

  return (
    <View style={{ width }}>
      <View style={{ width, height: chartHeight + 22 }}>
        {/* Y-axis labels */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: chartHeight,
            width: yAxisWidth - 4,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 1,
          }}
        >
          {yTicks.map((t, i) => (
            <AtTypography key={i} variant="label" color="#8892A4">
              {t === 0 ? '0' : String(Math.round(t))}
            </AtTypography>
          ))}
        </View>

        <View style={{ marginLeft: yAxisWidth, position: 'relative' }}>
          {/* Dashed grid lines */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: chartHeight,
              justifyContent: 'space-between',
            }}
          >
            {yTicks.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 1,
                  borderTopWidth: 1,
                  borderTopColor: tokens.color.border.default,
                  borderStyle: 'dashed',
                }}
              />
            ))}
          </View>

          {/* Histórico (navy) */}
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <AreaChart
              data={historico}
              width={chartWidth}
              height={chartHeight}
              color={ASOCIADOS_HISTORICO_COLOR}
              smooth
              strokeWidth={2.5}
              strokeOpacity={1}
              gradientId="grad-asociados-historico"
              yMin={0}
              yMax={yMax}
              fillGradient={{
                stops: [
                  { offset: 0, color: ASOCIADOS_HISTORICO_COLOR, opacity: 0 },
                  { offset: 1, color: ASOCIADOS_HISTORICO_COLOR, opacity: 0 },
                ],
              }}
            />
          </View>

          {/* Corriente (naranja, referencia) */}
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <AreaChart
              data={corriente}
              width={chartWidth}
              height={chartHeight}
              color={ASOCIADOS_CORRIENTE_COLOR}
              smooth={false}
              strokeWidth={2.5}
              strokeOpacity={1}
              gradientId="grad-asociados-corriente"
              yMin={0}
              yMax={yMax}
              fillGradient={{
                stops: [
                  { offset: 0, color: ASOCIADOS_CORRIENTE_COLOR, opacity: 0 },
                  { offset: 1, color: ASOCIADOS_CORRIENTE_COLOR, opacity: 0 },
                ],
              }}
            />
          </View>

          {/* X-axis month labels */}
          <View
            style={{
              position: 'absolute',
              top: chartHeight + 4,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {labels.map((m, i) => (
              <AtTypography key={i} variant="label" color="#8892A4">
                {m}
              </AtTypography>
            ))}
          </View>
        </View>
      </View>

      {/* Leyenda */}
      <View className="flex-row justify-center items-center gap-4 mt-2">
        <View className="flex-row items-center gap-1.5">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: ASOCIADOS_CORRIENTE_COLOR,
            }}
          />
          <AtTypography variant="label" color="#6B7280">
            Corriente
          </AtTypography>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: ASOCIADOS_HISTORICO_COLOR,
            }}
          />
          <AtTypography variant="label" color="#6B7280">
            Histórico
          </AtTypography>
        </View>
      </View>
    </View>
  );
});
ReportDualLineChart.displayName = 'ReportDualLineChart';

interface BancoSlice {
  id: string;
  name: string;
  balance: number;
  color: string;
}

/**
 * Donut de Bancos: una rodaja por empresa (saldo) y debajo una rejilla de
 * chips compactos en 2 columnas (color + nombre + monto). Tocar una rodaja
 * o un chip muestra su % en el centro del donut.
 */
const ReportBancosDonut = memo<{ empresas: BancoSlice[]; width: number }>(
  ({ empresas, width }) => {
    const [selected, setSelected] = useState<number | null>(null);

    const total = useMemo(
      () => empresas.reduce((s, e) => s + e.balance, 0),
      [empresas],
    );
    // Top-N + "Otros": colapsamos a ≤4 chips para que quepan en 4 esquinas.
    const FIT = 4;
    const collapse = empresas.length > FIT;
    const headCount = collapse ? FIT - 1 : empresas.length;
    const head = empresas.slice(0, headCount);
    const tail = empresas.slice(headCount);
    const tailSum = tail.reduce((s, e) => s + e.balance, 0);
    const hasOtros = collapse && tailSum > 0;

    const slices = useMemo(
      () => [
        ...head.map((e) => ({ value: e.balance, color: e.color, label: e.name })),
        ...(hasOtros
          ? [{ value: tailSum, color: OTROS_SEGMENT_COLOR, label: 'Otros' }]
          : []),
      ],
      [head, hasOtros, tailSum],
    );

    const chips = [
      ...head.map((e) => ({
        key: e.id,
        name: e.name,
        balance: e.balance,
        color: e.color,
      })),
      ...(hasOtros
        ? [
            {
              key: '__otros__',
              name: `Otros (${tail.length})`,
              balance: tailSum,
              color: OTROS_SEGMENT_COLOR,
            },
          ]
        : []),
    ];

    const size = Math.min(150, Math.max(120, width));
    const containerH = size + 56;
    const pct =
      selected != null && total > 0
        ? (slices[selected].value / total) * 100
        : null;

    const toggle = (i: number) =>
      setSelected((prev) => (prev === i ? null : i));

    // Esquinas para los chips flotantes (en orden de los slices).
    const CORNERS: Array<Record<string, number>> = [
      { top: 0, left: 0 },
      { top: 0, right: 0 },
      { bottom: 0, left: 0 },
      { bottom: 0, right: 0 },
    ];

    return (
      <View style={{ width, height: containerH }}>
        {/* Donut centrado */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DonutChart
            data={slices}
            size={size}
            innerRadius={0.62}
            padAngle={2}
            onSlicePress={toggle}
            selectedIndex={selected}
          >
            {pct != null && (
              <AtTypography
                variant="h3"
                color="#1A1F36"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {`${pct.toFixed(0)}%`}
              </AtTypography>
            )}
          </DonutChart>
        </View>

        {/* Chips flotantes en las esquinas */}
        {chips.map((c, i) => {
          const active = selected === i;
          return (
            <Pressable
              key={c.key}
              onPress={() => toggle(i)}
              style={{
                position: 'absolute',
                maxWidth: 100,
                ...CORNERS[i],
                borderRadius: 8,
                borderCurve: 'continuous',
                paddingHorizontal: 8,
                paddingVertical: 5,
                backgroundColor: c.color,
                opacity: selected == null || active ? 1 : 0.5,
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
              }}
            >
              <AtTypography
                variant="captionBold"
                color="#FFFFFF"
                numberOfLines={1}
              >
                {c.name}
              </AtTypography>
              <AtTypography
                variant="label"
                color="rgba(255,255,255,0.9)"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatCurrency(c.balance)}
              </AtTypography>
            </Pressable>
          );
        })}
      </View>
    );
  },
);
ReportBancosDonut.displayName = 'ReportBancosDonut';

/**
 * Gauge de Presupuestos: medidor semicircular con gradiente + etiquetas de
 * escala (min/max) bajo cada extremo. Visual por ahora (sin conexión real).
 */
const ReportGauge = memo<{
  width: number;
  minLabel: string;
  maxLabel: string;
}>(({ width, minLabel, maxLabel }) => {
  const w = Math.min(width, 220);
  return (
    <View style={{ alignItems: 'center' }}>
      <GaugeChart width={w} />
      <View
        style={{
          width: w,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 6,
          marginTop: 4,
        }}
      >
        <AtTypography variant="caption" color="#8892A4">
          {minLabel}
        </AtTypography>
        <AtTypography variant="caption" color="#8892A4">
          {maxLabel}
        </AtTypography>
      </View>
    </View>
  );
});
ReportGauge.displayName = 'ReportGauge';

/**
 * Stats de Seguros: tres tarjetas KPI (total / vencidas / por vencer) con
 * borde y fondo tintados. Valores derivados de useSeguros (3 dominios).
 */
const SEGUROS_CARDS = [
  { key: 'total', label: 'Total pólizas', border: '#3FB97A', bg: '#F0FAF4' },
  { key: 'vencidas', label: 'Pólizas Vencidas', border: '#E5544A', bg: '#FDF1F0' },
  { key: 'porvencer', label: 'Pólizas por vencer', border: '#E89A3E', bg: '#FEF7EE' },
] as const;

const ReportSegurosStats = memo<{
  total: number;
  vencidas: number;
  porVencer: number;
}>(({ total, vencidas, porVencer }) => {
  const values: Record<string, number> = {
    total,
    vencidas,
    porvencer: porVencer,
  };
  return (
    <View className="flex-row gap-2">
      {SEGUROS_CARDS.map((c) => (
        <View
          key={c.key}
          className="flex-1 items-center rounded-lg px-1 py-3 gap-1"
          style={{
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.bg,
            borderCurve: 'continuous',
          }}
        >
          <AtTypography
            variant="h2"
            color="#1A1F36"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {String(values[c.key])}
          </AtTypography>
          <AtTypography
            variant="caption"
            color="#6B7280"
            numberOfLines={2}
            className="text-center"
          >
            {c.label}
          </AtTypography>
        </View>
      ))}
    </View>
  );
});
ReportSegurosStats.displayName = 'ReportSegurosStats';

interface PagoDay {
  iso: string;
  day: number;
  total: number;
  bucket: MontoBucket | null;
}

/**
 * Mini-calendario de Pagos: pill del mes + una semana (Lun–Vie arriba,
 * Sáb–Dom abajo) con día + monto compacto, coloreado por bucket.
 */
const ReportPagosCalendar = memo<{ days: PagoDay[]; monthLabel: string }>(
  ({ days, monthLabel }) => {
    const weekdays = days.slice(0, 5); // L M M J V
    const weekend = days.slice(5); // S D

    return (
      <View className="gap-2">
        {/* Pill del mes */}
        <View
          className="self-start rounded-md px-3 py-1"
          style={{ backgroundColor: '#EEF1F5', borderCurve: 'continuous' }}
        >
          <AtTypography variant="captionBold" color="#1A1F36">
            {monthLabel}
          </AtTypography>
        </View>

        {/* Lun–Vie */}
        <View className="gap-1">
          <View className="flex-row gap-1">
            {['L', 'M', 'M', 'J', 'V'].map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <AtTypography variant="caption" color="#8892A4">
                  {w}
                </AtTypography>
              </View>
            ))}
          </View>
          <View className="flex-row gap-1">
            {weekdays.map((d) => (
              <PagoDayCell key={d.iso} day={d} />
            ))}
          </View>
        </View>

        {/* Sáb–Dom (alineados a las dos primeras columnas) */}
        <View className="gap-1">
          <View className="flex-row gap-1">
            {['S', 'D'].map((w, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <AtTypography variant="caption" color="#8892A4">
                  {w}
                </AtTypography>
              </View>
            ))}
            <View style={{ flex: 3 }} />
          </View>
          <View className="flex-row gap-1">
            {weekend.map((d) => (
              <PagoDayCell key={d.iso} day={d} />
            ))}
            <View style={{ flex: 3 }} />
          </View>
        </View>
      </View>
    );
  },
);
ReportPagosCalendar.displayName = 'ReportPagosCalendar';

const PagoDayCell = memo<{ day: PagoDay }>(({ day }) => {
  if (day.total === 0 || !day.bucket) {
    return (
      <View
        style={{
          flex: 1,
          aspectRatio: 1,
          backgroundColor: '#F3F4F6',
          borderRadius: 8,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AtTypography variant="captionBold" color="#8892A4">
          {String(day.day)}
        </AtTypography>
      </View>
    );
  }
  const tone = MONTO_BUCKET_COLOR[day.bucket];
  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: tone.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: tone.border,
        borderCurve: 'continuous',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <AtTypography variant="captionBold" color={tone.text}>
        {String(day.day)}
      </AtTypography>
      <AtTypography variant="label" color={tone.text} style={{ fontSize: 10 }}>
        {compactMoney(day.total)}
      </AtTypography>
    </View>
  );
});
PagoDayCell.displayName = 'PagoDayCell';
