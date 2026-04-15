/**
 * Organism: GreetingHeader
 *
 * "Bienvenido, Alejandro" section from mockup.
 */

import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { tokens } from '@/src/theme/tokens';

interface GreetingHeaderProps {
  name: string;
}

export const GreetingHeader = memo<GreetingHeaderProps>(({ name }) => {
  return (
    <View style={{ paddingHorizontal: tokens.spacing.lg }}>
      <Text
        style={{
          ...tokens.typography.h1,
          color: tokens.color.ink.primary,
        }}
      >
        Bienvenido, {name}
      </Text>
    </View>
  );
});

GreetingHeader.displayName = 'GreetingHeader';
