/**
 * Template: DashboardTemplate
 *
 * Scrollable layout for dashboard pages.
 * Handles safe area, spacing between sections.
 */

import React, { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { tokens } from '@/src/theme/tokens';

interface DashboardTemplateProps {
  children: React.ReactNode;
}

export const DashboardTemplate = memo<DashboardTemplateProps>(
  ({ children }) => {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: tokens.color.background.secondary }}
        contentContainerStyle={{
          gap: tokens.spacing['2xl'],
          paddingBottom: tokens.spacing['5xl'],
          paddingTop: tokens.spacing.lg,
        }}
      >
        {children}
      </ScrollView>
    );
  },
);

DashboardTemplate.displayName = 'DashboardTemplate';
