import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ford,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        tabBarStyle: {
          borderTopColor: colors.line,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="speedometer" size={size} />
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Revisoes",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="construct" size={size} />
        }}
      />
      <Tabs.Screen
        name="dealers"
        options={{
          title: "Rede",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="location" size={size} />
        }}
      />
      <Tabs.Screen
        name="benefits"
        options={{
          title: "Beneficios",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="ribbon" size={size} />
        }}
      />
    </Tabs>
  );
}
