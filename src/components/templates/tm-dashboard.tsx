/**
 * Template: TmDashboard
 *
 * Scrollable layout for dashboard/home pages.
 * Handles safe area, spacing between sections.
 * Migrated to NativeWind.
 */

import React, { memo } from 'react';
import { ScrollView } from '@/src/tw';

interface TmDashboardProps {
  children: React.ReactNode;
  className?: string;
}

export const TmDashboard = memo<TmDashboardProps>(({ children, className }) => {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      className={`flex-1 bg-bg-secondary ${className ?? ''}`}
      contentContainerClassName="gap-6 pb-12 pt-4"
    >
      {children}
    </ScrollView>
  );
});

TmDashboard.displayName = 'TmDashboard';
