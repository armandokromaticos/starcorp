/**
 * Explore Screen — placeholder
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { tokens } from '@/src/theme/tokens';

export default function ExploreScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: tokens.color.background.secondary }}
      contentContainerStyle={{
        padding: tokens.spacing.lg,
        gap: tokens.spacing.lg,
      }}
    >
      <Text style={{ ...tokens.typography.h2, color: tokens.color.ink.primary }}>
        Explorar
      </Text>
      <Text style={{ ...tokens.typography.body, color: tokens.color.ink.secondary }}>
        Sección de exploración — próximamente.
      </Text>
    </ScrollView>
  );
}
