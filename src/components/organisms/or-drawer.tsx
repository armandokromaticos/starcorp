/**
 * Organism: OrDrawer
 *
 * Lateral navigation panel. REWRITTEN:
 * - Reanimated instead of old Animated API
 * - Pressable instead of TouchableOpacity
 * - useWindowDimensions instead of Dimensions.get
 * - NativeWind + AtTypography + AtIcon
 */

import { AtIcon } from "@/src/components/atoms/at-icon";
import { AtGradientIcon } from "@/src/components/atoms/at-gradient-icon";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { Pressable, View } from "@/src/tw";
import type { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { memo, useCallback, useEffect, useState } from "react";
import { Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideOutLeft,
} from "react-native-reanimated";

const ENTER_DURATION = 280;
const EXIT_DURATION = 260;

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface DrawerMenuItem {
  id: string;
  label: string;
  icon: IoniconsName;
}

export interface OrDrawerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  activeSection?: string;
  menuItems?: DrawerMenuItem[];
  onItemPress?: (id: string) => void;
}

const DRAWER_WIDTH = 280;

const DEFAULT_MENU_ITEMS: DrawerMenuItem[] = [
  { id: "consolidado", label: "Consolidado", icon: "home" },
  { id: "financiero", label: "Financiero", icon: "wallet" },
  { id: "clientes", label: "Clientes", icon: "people" },
  { id: "informes", label: "Informes", icon: "megaphone" },
  { id: "reportes", label: "Reportes", icon: "stats-chart" },
  { id: "empresas", label: "Otras compañías", icon: "briefcase" },
];

const ROUTE_MAP: Record<string, string> = {
  consolidado: "/(tabs)",
  financiero: "/(tabs)/financiero",
  clientes: "/(tabs)/clientes",
  informes: "/(tabs)/informes",
  reportes: "/(tabs)/reportes",
};

export const OrDrawer = memo<OrDrawerProps>(
  ({
    visible,
    onClose,
    title,
    activeSection = "consolidado",
    menuItems,
    onItemPress,
  }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [mounted, setMounted] = useState(visible);

    const items = menuItems ?? DEFAULT_MENU_ITEMS;

    useEffect(() => {
      if (visible) {
        setMounted(true);
        return;
      }
      const timer = setTimeout(() => setMounted(false), EXIT_DURATION + 50);
      return () => clearTimeout(timer);
    }, [visible]);

    const handleItemPress = useCallback(
      (id: string) => {
        onClose();
        setTimeout(() => {
          if (onItemPress) {
            onItemPress(id);
          } else {
            const route = ROUTE_MAP[id];
            if (route) {
              router.navigate(route as never);
            }
          }
        }, EXIT_DURATION);
      },
      [onItemPress, onClose, router],
    );

    if (!mounted) {
      return null;
    }

    const showContent = visible;

    return (
      <Modal
        visible={mounted}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View
          style={{
            flex: 1,
            pointerEvents: visible ? "auto" : "none",
          }}
        >
          {showContent && (
            <Animated.View
              key="drawer-overlay"
              entering={FadeIn.duration(ENTER_DURATION)}
              exiting={FadeOut.duration(EXIT_DURATION)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <Pressable onPress={onClose} style={{ flex: 1 }} />
            </Animated.View>
          )}

          {showContent && (
            <Animated.View
              key="drawer-panel"
              entering={SlideInLeft.duration(ENTER_DURATION)}
              exiting={SlideOutLeft.duration(EXIT_DURATION)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: DRAWER_WIDTH,
                backgroundColor: "#FFFFFF",
                paddingTop: insets.top + 16,
                paddingBottom: insets.bottom,
                boxShadow: "2px 0 8px rgba(0, 0, 0, 0.25)",
              }}
            >
              <View className="flex-row justify-end items-center px-6 pb-6">
                <Pressable onPress={onClose} hitSlop={8}>
                  <AtIcon name="close" size="lg" color="#1A1F36" />
                </Pressable>
              </View>

              <View className="px-6 gap-7">
                {items.map((item) => {
                  const isActive = item.id === activeSection;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleItemPress(item.id)}
                      className="flex-row items-center gap-4"
                    >
                      <AtGradientIcon
                        name={item.icon}
                        variant="ionicons"
                        size={36}
                        gradient={isActive ? "brandOrange" : "brandNavy"}
                      />
                      <AtTypography variant="bodyBold" color="#1A1F36">
                        {item.label}
                      </AtTypography>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    );
  },
);

OrDrawer.displayName = "OrDrawer";
