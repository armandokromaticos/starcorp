/**
 * Organism: OrTercerosList
 *
 * List of terceros (vendors/suppliers) with search and color dots.
 * Used in Costos/Gastos → Grupos → Terceros views.
 */

import React, { memo, useState, useMemo } from 'react';
import { View, ScrollView, TextInput, Pressable } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtColorDot } from '@/src/components/atoms/at-color-dot';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtDivider } from '@/src/components/atoms/at-divider';

export interface TerceroItem {
  id: string;
  name: string;
  color: string;
  amount: number;
}

interface OrTercerosListProps {
  terceros: TerceroItem[];
  showSearch?: boolean;
  onTerceroPress?: (id: string) => void;
  className?: string;
}

export const OrTercerosList = memo<OrTercerosListProps>(
  ({ terceros, showSearch = true, onTerceroPress, className }) => {
    const [searchText, setSearchText] = useState('');

    const filtered = useMemo(() => {
      if (!searchText.trim()) return terceros;
      const lower = searchText.toLowerCase();
      return terceros.filter((t) => t.name.toLowerCase().includes(lower));
    }, [terceros, searchText]);

    return (
      <View className={`gap-3 ${className ?? ''}`}>
        {showSearch && (
          <View
            className="flex-row items-center mx-4 px-3 py-2 bg-bg-secondary rounded-md gap-2"
            style={{ borderCurve: 'continuous' }}
          >
            <AtIcon name="search" size="sm" color="#8892A4" />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por terceros"
              placeholderTextColor="#8892A4"
              className="flex-1 text-sm p-0"
              style={{ fontFamily: 'Roboto_400Regular', color: '#1A1F36' }}
            />
          </View>
        )}

        <ScrollView className="flex-1">
          {filtered.map((tercero, i) => (
            <React.Fragment key={tercero.id}>
              <Pressable
                onPress={() => onTerceroPress?.(tercero.id)}
                className="flex-row items-center py-3 px-4 gap-3"
              >
                <AtColorDot color={tercero.color} size="md" shape="square" />
                <AtTypography variant="body" className="flex-1" numberOfLines={1}>
                  {tercero.name}
                </AtTypography>
                <AtTypography
                  variant="body"
                  color="#4A5568"
                  selectable
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  ${tercero.amount.toLocaleString()}
                </AtTypography>
              </Pressable>
              {i < filtered.length - 1 && <AtDivider className="mx-4" />}
            </React.Fragment>
          ))}
          {filtered.length === 0 && (
            <View className="items-center py-8">
              <AtTypography variant="body" color="#8892A4">
                No se encontraron terceros
              </AtTypography>
            </View>
          )}
        </ScrollView>
      </View>
    );
  },
);

OrTercerosList.displayName = 'OrTercerosList';
