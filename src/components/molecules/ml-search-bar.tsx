/**
 * Molecule: MlSearchBar
 *
 * Search input with hamburger menu icon and search icon.
 * Migrated to NativeWind + AtIcon.
 */

import React, { memo, useState } from 'react';
import { View, TextInput, Pressable } from '@/src/tw';
import { AtIcon } from '@/src/components/atoms/at-icon';

interface MlSearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onMenuPress?: () => void;
}

export const MlSearchBar = memo<MlSearchBarProps>(
  ({
    placeholder = 'Buscar por cliente o empresa',
    onSearch,
    onMenuPress,
  }) => {
    const [text, setText] = useState('');

    return (
      <View
        className="flex-row items-center bg-bg-card rounded-lg px-4 py-3 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Pressable onPress={onMenuPress} hitSlop={8}>
          <AtIcon name="menu" size="lg" color="#4A5568" />
        </Pressable>

        <AtIcon name="search" size="md" color="#8892A4" />

        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            onSearch?.(t);
          }}
          placeholder={placeholder}
          placeholderTextColor="#8892A4"
          className="flex-1 text-base text-ink-primary p-0"
          style={{ fontFamily: 'Roboto_400Regular' }}
        />
      </View>
    );
  },
);

MlSearchBar.displayName = 'MlSearchBar';
