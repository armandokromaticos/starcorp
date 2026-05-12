/**
 * Organism: OrTercerosList
 *
 * Search bar + scrollable list of terceros (vendors/suppliers).
 * Used in Costos/Gastos → Grupos → Terceros views.
 *
 * Each row:
 *   - Gradient color swatch (AtColorDot with gradientColors)
 *   - Bold name + amount below in lighter style
 *   - Soft delta chip (AtDeltaIndicator appearance="soft")
 */

import React, { memo, useState, useMemo } from 'react';
import { View, TextInput, Pressable } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtColorDot } from '@/src/components/atoms/at-color-dot';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { formatCurrency } from '@/src/utils/currency';
import type { ThirdParty } from '@/src/types/domain.types';

interface OrTercerosListProps {
  terceros: ThirdParty[];
  onTerceroPress?: (id: string) => void;
}

export const OrTercerosList = memo<OrTercerosListProps>(
  ({ terceros, onTerceroPress }) => {
    const [searchText, setSearchText] = useState('');

    const filtered = useMemo(() => {
      if (!searchText.trim()) return terceros;
      const lower = searchText.toLowerCase();
      return terceros.filter((t) => t.name.toLowerCase().includes(lower));
    }, [terceros, searchText]);

    return (
      <View className="gap-4">
        {/* Search bar — white card, rounded-full, magnifying glass left */}
        <View className="px-4">
          <View
            className="flex-row items-center bg-bg-card px-4 gap-3"
            style={{
              borderRadius: 24,
              borderCurve: 'continuous',
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.08)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
          >
            <AtIcon name="search" size="sm" color="#8892A4" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por terceros"
              placeholderTextColor="#8892A4"
              className="flex-1 p-0"
              style={{ fontFamily: 'Roboto_400Regular', fontSize: 14, color: '#1A1F36' }}
            />
          </View>
        </View>

        {/* Tercero rows */}
        <View className="px-4 gap-4">
          {filtered.map((tercero) => (
            <Pressable
              key={tercero.id}
              onPress={() => onTerceroPress?.(tercero.id)}
              className="flex-row items-center gap-3"
            >
              {/* Gradient color swatch */}
              <AtColorDot
                color={tercero.color}
                gradientColors={tercero.gradientColors}
                size="lg"
                shape="square"
              />

              {/* Name + amount stacked */}
              <View className="flex-1 gap-0.5">
                <AtTypography variant="bodyBold" numberOfLines={1}>
                  {tercero.name}
                </AtTypography>
                <AtTypography variant="caption" color="#8892A4" selectable style={{ fontVariant: ['tabular-nums'] }}>
                  {formatCurrency(tercero.amount, { currency: 'USD', compact: false })}
                </AtTypography>
              </View>

              {/* Soft delta chip */}
              <AtDeltaIndicator value={tercero.deltaPercent} size="sm" appearance="soft" />
            </Pressable>
          ))}

          {filtered.length === 0 && (
            <View className="items-center py-8">
              <AtTypography variant="body" color="#8892A4">
                No se encontraron terceros
              </AtTypography>
            </View>
          )}
        </View>
      </View>
    );
  },
);

OrTercerosList.displayName = 'OrTercerosList';
