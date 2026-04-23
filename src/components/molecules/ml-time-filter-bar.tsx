/**
 * Molecule: MlTimeFilterBar
 *
 * Horizontal pill container with period options.
 * Selected option uses brandOrange gradient; others are text-only.
 */

import { AtTypography } from "@/src/components/atoms/at-typography";
import { gradients } from "@/src/theme/gradients";
import { Pressable, View } from "@/src/tw";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";

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
      <View className={`px-4 ${className ?? ""}`}>
        <View
          className="bg-bg-card py-1.5 px-2 rounded-full"
          style={{
            borderCurve: "continuous",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          }}
        >
          <View className="flex-row items-center justify-center gap-4">
            {options.map((opt) => {
              const isSelected = selectedKey === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => onSelect(opt.key)}
                  hitSlop={6}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.brandOrange.colors}
                      start={gradients.brandOrange.start}
                      end={gradients.brandOrange.end}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 999,
                      }}
                    >
                      <AtTypography variant="captionBold" color="#FFFFFF">
                        {opt.label}
                      </AtTypography>
                    </LinearGradient>
                  ) : (
                    <View className="px-2 py-2.5">
                      <AtTypography variant="caption" color="#1A1F36">
                        {opt.label}
                      </AtTypography>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  },
);

MlTimeFilterBar.displayName = "MlTimeFilterBar";
