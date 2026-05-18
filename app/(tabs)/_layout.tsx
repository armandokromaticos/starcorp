/**
 * Tab Layout
 *
 * Bottom tab navigation matching the mockup tab bar.
 * Gradient icons (brandOrange active / brandNavy inactive) to match drawer.
 */

import { AtGradientIcon } from "@/src/components/atoms/at-gradient-icon";
import { OrGlobalSearchModal } from "@/src/components/organisms/or-global-search-modal";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const companies = useCompanies();

  if (companies.isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F8FA" }}>
        <ActivityIndicator color="#20307E" />
      </View>
    );
  }

  if (companies.isError || !companies.data || companies.data.length === 0) {
    return <Redirect href="/connect" />;
  }

  return (
    <View style={{ flex: 1 }}>
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
        name="(consolidado)"
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
      <Tabs.Screen name="egresos" options={{ href: null }} />
      <Tabs.Screen name="ingresos" options={{ href: null }} />
      <Tabs.Screen name="costos" options={{ href: null }} />
      <Tabs.Screen name="gastos" options={{ href: null }} />
      <Tabs.Screen name="utilidad" options={{ href: null }} />
      </Tabs>

      <OrGlobalSearchModal />
    </View>
  );
}
