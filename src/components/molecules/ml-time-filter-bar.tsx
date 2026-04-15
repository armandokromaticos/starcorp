/**
 * Molecule: MlTimeFilterBar
 *
 * Horizontal scrollable row of AtChip atoms for period selection.
 * Decoupled from store — accepts props for full reusability.
 */

import React, { memo } from 'react';
import { ScrollView } from '@/src/tw';
import { AtChip } from '@/src/components/atoms/at-chip';

export interface TimeFilterOption {
  key: string;
  label: string;
}

interface MlTimeFilterBarProps {
  options: TimeFilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  className?: string;
}

export const MlTimeFilterBar = memo<MlTimeFilterBarProps>(
  ({ options, selectedKey, onSelect, className }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName={`gap-2 px-4 ${className ?? ''}`}
      >
        {options.map((opt) => (
          <AtChip
            key={opt.key}
            label={opt.label}
            selected={selectedKey === opt.key}
            onPress={() => onSelect(opt.key)}
          />
        ))}
      </ScrollView>
    );
  },
);

MlTimeFilterBar.displayName = 'MlTimeFilterBar';
