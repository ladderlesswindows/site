import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We render our own BrandingHeader inside the screens
      }}
    >
      <Stack.Screen
        name="screens-before"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="screens-after"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
