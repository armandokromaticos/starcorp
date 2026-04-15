/**
 * Organism: OrDrawer
 *
 * Lateral navigation panel. REWRITTEN:
 * - Reanimated instead of old Animated API
 * - Pressable instead of TouchableOpacity
 * - useWindowDimensions instead of Dimensions.get
 * - NativeWind + AtTypography + AtIcon
 */

import React, { memo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { View, Pressable } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface DrawerMenuItem {
  id: string;
  label: string;
  icon: MaterialIconName;
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
  { id: 'consolidado', label: 'Consolidado', icon: 'home' },
  { id: 'financiero', label: 'Financiero', icon: 'account-balance' },
  { id: 'clientes', label: 'Clientes', icon: 'people' },
  { id: 'informes', label: 'Informes', icon: 'campaign' },
  { id: 'reportes', label: 'Reportes', icon: 'bar-chart' },
  { id: 'empresas', label: 'Otras compañías', icon: 'business' },
];

export const OrDrawer = memo<OrDrawerProps>(({
  visible,
  onClose,
  title,
  activeSection = 'consolidado',
  menuItems,
  onItemPress,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  const items = menuItems ?? DEFAULT_MENU_ITEMS;

  useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 200 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, translateX, overlayOpacity]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) {
    return null;
  }

  return (
    <View
      className="absolute inset-0 z-50"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {/* Overlay */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          overlayStyle,
        ]}
      >
        <Pressable
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: DRAWER_WIDTH,
            height: screenHeight,
            backgroundColor: '#FFFFFF',
            paddingTop: 56,
            boxShadow: '2px 0 8px rgba(0, 0, 0, 0.25)',
          },
          drawerStyle,
        ]}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 pb-4 border-b border-border">
          <AtTypography variant="h3">
            {title || 'Menu'}
          </AtTypography>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 rounded-full bg-bg-tertiary items-center justify-center"
          >
            <AtIcon name="close" size="sm" color="#4A5568" />
          </Pressable>
        </View>

        {/* Menu items */}
        <View className="pt-4 px-3">
          {items.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  onItemPress?.(item.id);
                  onClose();
                }}
                className={`flex-row items-center py-3 px-3 rounded-md mb-1 gap-3 ${
                  isActive ? 'bg-accent-muted' : ''
                }`}
              >
                <AtIcon
                  name={item.icon}
                  size="md"
                  color={isActive ? '#E8952E' : '#4A5568'}
                />
                <AtTypography
                  variant={isActive ? 'bodyBold' : 'body'}
                  color={isActive ? '#E8952E' : '#4A5568'}
                >
                  {item.label}
                </AtTypography>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
});

OrDrawer.displayName = 'OrDrawer';
