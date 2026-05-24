import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProvider } from "@/context/AppContext";

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="schedule"
          options={{
            presentation: "modal"
          }}
        />
      </Stack>
    </AppProvider>
  );
}
