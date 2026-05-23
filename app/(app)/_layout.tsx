import {} from "convex/react";
import { Stack } from "expo-router";
import {} from "react-native";

import {} from "@/convex/_generated/api";

const AppLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default AppLayout;
