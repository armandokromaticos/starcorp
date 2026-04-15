/**
 * Home Dashboard Page
 *
 * Assembles organisms into the full dashboard view matching the mockup.
 * Data flows: mock data → TanStack Query hooks → organisms → render.
 */

import { SearchBar } from "@/src/components/molecules/search-bar";
import { TimeFilterBar } from "@/src/components/molecules/time-filter-bar";
import { CategoryCarousel } from "@/src/components/organisms/category-carousel";
import { Drawer } from "@/src/components/organisms/drawer";
import { GreetingHeader } from "@/src/components/organisms/greeting-header";
import { RevenueChartCard } from "@/src/components/organisms/revenue-chart-card";
import { TopClientsSection } from "@/src/components/organisms/top-clients-section";
import { DashboardTemplate } from "@/src/components/templates/dashboard-template";
import { tokens } from "@/src/theme/tokens";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <DashboardTemplate>
      {/* Search bar */}
      <View style={{ paddingHorizontal: tokens.spacing.lg }}>
        <SearchBar onMenuPress={() => setDrawerVisible(true)} />
      </View>
      {/* Time period filter */}
      <TimeFilterBar />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: tokens.spacing.lg }} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <GreetingHeader name="Alejandro" />

        {/* Section: Empresas (Consolidado) */}
        <View style={{ gap: tokens.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: tokens.spacing.lg,
            }}
          >
            <Text
              style={{
                ...tokens.typography.h2,
                color: tokens.color.ink.primary,
              }}
            >
              Empresas (Consolidado)
            </Text>
          </View>
          <RevenueChartCard />
        </View>

        {/* Category carousel */}
        <CategoryCarousel />

        {/* Top clients */}
        <TopClientsSection />
      </ScrollView>

      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="dashboard"
      />
    </DashboardTemplate>
  );
}
