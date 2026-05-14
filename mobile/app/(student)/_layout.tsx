/**
 * mobile/app/(student)/_layout.tsx
 * Bottom tab navigator for Student role.
 */

import { Tabs } from "expo-router";
import { colors, typography } from "../../src/theme";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg2,
          borderTopColor: colors.bg4,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {
          fontSize: typography.xs,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ title: "Quizzes", tabBarIcon: ({ color }) => <TabIcon emoji="📖" color={color} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: "Progress", tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 18, opacity: color === colors.accent ? 1 : 0.5 }}>{emoji}</Text>;
}
