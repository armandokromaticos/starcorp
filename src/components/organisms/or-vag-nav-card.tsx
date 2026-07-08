/**
 * Organism: OrVagNavCard / OrVagNavTile
 *
 * Cards de navegación navy del hub de VAG.
 *  - OrVagNavCard (ancho completo): icono + título + flecha a la izquierda,
 *    chip de delta a la derecha y el monto grande debajo. Para Activos y
 *    Movimientos.
 *  - OrVagNavTile (media columna): icono arriba, título centrado, monto,
 *    delta, divider y "Ver cuentas →". Para Ctas. por cobrar/pagar.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { formatCurrency } from '@/src/utils/currency';

const NAVY = '#0F1B4A';

interface OrVagNavCardProps {
  icon: string;
  iconColor: string;
  title: string;
  total: number;
  deltaPct: number;
  onPress: () => void;
}

export const OrVagNavCard = memo<OrVagNavCardProps>(
  ({ icon, iconColor, title, total, deltaPct, onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="rounded-xl px-4 py-4 gap-1"
        style={{ backgroundColor: NAVY, borderCurve: 'continuous' }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AtIcon name={icon as never} size="md" color={iconColor} />
            <AtTypography variant="bodyBold" color="#FFFFFF">
              {title}
            </AtTypography>
            <AtIcon name="arrow-forward" size="sm" color="#FFFFFF" />
          </View>
          <AtDeltaIndicator value={deltaPct} size="md" appearance="dark" />
        </View>
        <AtTypography
          variant="metricSmall"
          color="#FFFFFF"
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {formatCurrency(total)}
        </AtTypography>
      </Pressable>
    );
  },
);

OrVagNavCard.displayName = 'OrVagNavCard';

interface OrVagNavTileProps {
  icon: string;
  title: string;
  total: number;
  deltaPct: number;
  actionLabel?: string;
  onPress: () => void;
}

export const OrVagNavTile = memo<OrVagNavTileProps>(
  ({ icon, title, total, deltaPct, actionLabel = 'Ver cuentas', onPress }) => {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="flex-1 rounded-xl px-3 py-4 items-center gap-2"
        style={{ backgroundColor: NAVY, borderCurve: 'continuous' }}
      >
        <AtIcon name={icon as never} size="lg" color="#5B8DEF" />
        <AtTypography
          variant="bodyBold"
          color="#FFFFFF"
          className="text-center"
          numberOfLines={2}
        >
          {title}
        </AtTypography>
        <AtTypography
          variant="bodyBold"
          color="#FFFFFF"
          style={{ fontVariant: ['tabular-nums'], fontSize: 17 }}
        >
          {formatCurrency(total)}
        </AtTypography>
        <AtDeltaIndicator value={deltaPct} size="md" appearance="dark" />

        <View
          className="self-stretch"
          style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 4 }}
        />

        <View className="flex-row items-center gap-1.5">
          <AtTypography variant="captionBold" color="#FFFFFF">
            {actionLabel}
          </AtTypography>
          <AtIcon name="arrow-forward" size="sm" color="#FFFFFF" />
        </View>
      </Pressable>
    );
  },
);

OrVagNavTile.displayName = 'OrVagNavTile';
