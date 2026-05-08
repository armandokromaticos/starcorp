/**
 * Molecule: MlSearchBar
 *
 * Search input with hamburger menu icon and search icon.
 * Migrated to NativeWind + AtIcon.
 */

import { AtIcon } from "@/src/components/atoms/at-icon";
import { Pressable, TextInput, View } from "@/src/tw";
import React, { memo, useState } from "react";

interface MlSearchBarProps {
  placeholder?: string;
  onSearch?: (text: string) => void;
  onMenuPress?: () => void;
}

export const MlSearchBar = memo<MlSearchBarProps>(
  ({ placeholder = "Buscar por cliente o empresa", onSearch, onMenuPress }) => {
    const [text, setText] = useState("");

    return (
      <View className="flex-row items-center gap-4">
        <Pressable onPress={onMenuPress} hitSlop={12}>
          <AtIcon name="menu" size="lg" color="#1A1F36" />
        </Pressable>

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
      </View>
    );
  },
);

MlSearchBar.displayName = "MlSearchBar";
