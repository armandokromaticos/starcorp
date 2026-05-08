/**
 * Settings Screen (Modal)
 *
 * Configuration and app settings.
 */

import React from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { TmSettings } from '@/src/components/templates/tm-settings';

export default function SettingsScreen() {
  return (
    <TmSettings>
      <View className="items-center justify-center py-20 gap-4">
        <AtIcon name="settings" size="xl" color="#8892A4" />
        <AtTypography variant="body" color="#8892A4">
          Configuración — próximamente.
        </AtTypography>
      </View>
    </TmSettings>
  );
}
