/**
 * Molecule: MlSearchBar
 *
 * Search input with hamburger menu icon and search icon.
 * Migrated to NativeWind + AtIcon.
 */

import { AtIcon } from "@/src/components/atoms/at-icon";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { Pressable, TextInput, View } from "@/src/tw";
import React, { memo, useState } from "react";

interface MlSearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onMenuPress?: () => void;
  // Trigger mode: when provided, the input is replaced with a tappable
  // placeholder that fires `onPress`. Use this when the actual search UI
  // lives in a modal/portal and the bar is just an entry point.
  onPress?: () => void;
}

export const MlSearchBar = memo<MlSearchBarProps>(
  ({
    placeholder = "Buscar por cliente o empresa",
    onSearch,
    onMenuPress,
    onPress,
  }) => {
    const [text, setText] = useState("");
    const isTrigger = typeof onPress === "function";

    return (
      <View className="flex-row items-center gap-4">
        <Pressable onPress={onMenuPress} hitSlop={12}>
          <AtIcon name="menu" size="lg" color="#1A1F36" />
        </Pressable>

        {isTrigger ? (
          <Pressable
            onPress={onPress}
            className="flex-1 flex-row items-center gap-3 bg-bg-card pl-5 pr-5 py-4 rounded-full"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
          >
            <AtIcon name="search" size="md" color="#8892A4" />
            <AtTypography
              variant="body"
              color="#8892A4"
              className="flex-1"
              numberOfLines={1}
            >
              {placeholder}
            </AtTypography>
          </Pressable>
        ) : (
          <View
            className="flex-1 flex-row items-center gap-3 bg-bg-card pl-5 pr-5 py-4 rounded-full"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
          >
            <AtIcon name="search" size="md" color="#8892A4" />

            <TextInput
              value={text}
              onChangeText={(t) => {
                setText(t);
                onSearch?.(t);
              }}
              placeholder={placeholder}
              placeholderTextColor="#8892A4"
              className="flex-1 p-0 text-ink-primary text-base"
              style={{ fontFamily: "Roboto_400Regular" }}
            />
          </View>
        )}
      </View>
    );
  },
);

MlSearchBar.displayName = "MlSearchBar";
