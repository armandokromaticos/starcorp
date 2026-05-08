/**
 * Tab Layout
 *
 * Bottom tab navigation matching the mockup tab bar.
 * Gradient icons (brandOrange active / brandNavy inactive) to match drawer.
 */

import { AtGradientIcon } from "@/src/components/atoms/at-gradient-icon";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E8952E",
        tabBarInactiveTintColor: "#20307E",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#F6F8FA",
          borderTopWidth: 1,
          borderTopColor: "rgba(0, 0, 0, 0.08)",
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: "Roboto_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Consolidado",
          tabBarIcon: ({ focused, size }) => (
            <AtGradientIcon
              name="home"
              variant="ionicons"
              size={size}
              gradient={focused ? "brandOrange" : "brandNavy"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="financiero"
        options={{
          title: "Financiero",
          tabBarIcon: ({ focused, size }) => (
            <AtGradientIcon
              name="wallet"
              variant="ionicons"
              size={size}
              gradient={focused ? "brandOrange" : "brandNavy"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: "Clientes",
          tabBarIcon: ({ focused, size }) => (
            <AtGradientIcon
              name="people"
              variant="ionicons"
              size={size}
              gradient={focused ? "brandOrange" : "brandNavy"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="informes"
        options={{
          title: "Informes",
          tabBarIcon: ({ focused, size }) => (
            <AtGradientIcon
              name="megaphone"
              variant="ionicons"
              size={size}
              gradient={focused ? "brandOrange" : "brandNavy"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes"
        options={{
          title: "Reportes",
          tabBarIcon: ({ focused, size }) => (
            <AtGradientIcon
              name="stats-chart"
              variant="ionicons"
              size={size}
              gradient={focused ? "brandOrange" : "brandNavy"}
            />
          ),
        }}
      />
      <Tabs.Screen name="ingresos" options={{ href: null }} />
      <Tabs.Screen name="costos" options={{ href: null }} />
      <Tabs.Screen name="gastos" options={{ href: null }} />
      <Tabs.Screen name="egresos" options={{ href: null }} />
      <Tabs.Screen name="utilidad" options={{ href: null }} />
    </Tabs>
  );
}
