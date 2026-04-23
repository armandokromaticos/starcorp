/**
 * Template: TmFinanciero
 *
 * Template for Financiero screen.
 * Structure: Search + Company selector + Metric cards + Drill-down sections
 */

import { MlSearchBar } from "@/src/components/molecules/ml-search-bar";
import { ScrollView, View } from "@/src/tw";
import React, { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TmFinancieroProps {
  title?: string;
  onMenuPress?: () => void;
  children: React.ReactNode;
}

export const TmFinanciero = memo<TmFinancieroProps>(
  ({ title = "Financiero", onMenuPress, children }) => {
    const insets = useSafeAreaInsets();
    return (
      <View
        className="flex-1 bg-bg-secondary"
        style={{ paddingTop: insets.top }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-bg-secondary"
          contentContainerClassName="gap-4 pb-12"
        >
          <View className="px-4 pt-2">
            <MlSearchBar onMenuPress={onMenuPress} />
          </View>

          {/* Content: company carousel, metric cards, sections */}
          {children}
        </ScrollView>
      </View>
    );
  },
);

TmFinanciero.displayName = "TmFinanciero";
