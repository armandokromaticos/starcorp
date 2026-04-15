/**
 * Tab Layout
 *
 * Bottom tab navigation — matches the mockup's tab structure.
 */

import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { tokens } from '@/src/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tokens.color.accent.primary,
        tabBarInactiveTintColor: tokens.color.ink.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tokens.color.background.primary,
          borderTopColor: tokens.color.border.default,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📊</Text>
          ),
        }}
      />
    </Tabs>
  );
}
