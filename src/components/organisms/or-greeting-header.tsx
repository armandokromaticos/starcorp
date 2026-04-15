/**
 * Organism: OrGreetingHeader
 *
 * "Bienvenido, Alejandro" section from mockup.
 * Migrated to NativeWind + AtTypography.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface OrGreetingHeaderProps {
  name: string;
}

export const OrGreetingHeader = memo<OrGreetingHeaderProps>(({ name }) => {
  return (
    <View className="px-4">
      <AtTypography variant="h1">
        Bienvenido, {name}
      </AtTypography>
    </View>
  );
});

OrGreetingHeader.displayName = 'OrGreetingHeader';
