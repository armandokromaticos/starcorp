/**
 * Template: TmInformes
 *
 * Template for Informes/Reportes listing screens.
 * Scrollable with report row items.
 */

import { AtTypography } from "@/src/components/atoms/at-typography";
import { MlSearchBar } from "@/src/components/molecules/ml-search-bar";
import { ScrollView, View } from "@/src/tw";
import React, { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TmInformesProps {
  title?: string;
  onMenuPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const TmInformes = memo<TmInformesProps>(
  ({ title = "Informes", onMenuPress, children, className }) => {
    const insets = useSafeAreaInsets();
    return (
      <View
        className="flex-1 bg-bg-secondary"
        style={{ paddingTop: insets.top }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          className={`flex-1 bg-bg-secondary ${className ?? ""}`}
          contentContainerClassName="gap-4 pb-12"
        >
          <View className="px-4 pt-2">
            <MlSearchBar onMenuPress={onMenuPress} />
          </View>

          <View className="px-4">
            <AtTypography variant="h2">{title}</AtTypography>
          </View>

          {/* Content: report rows */}
          {children}
        </ScrollView>
      </View>
    );
  },
);

TmInformes.displayName = "TmInformes";
