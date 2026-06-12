import { Stack } from "expo-router";

export default function NewJobLayout() {
  return (
    <Stack
      screenOptions={{
        // We render our own BrandingHeader inside the screens (with logo + theme toggle).
        // Hiding the default Expo Router header removes the old solid blue "Ladderless" bar.
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="walls"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="camera"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="review"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="wall-capture"
        options={{
          headerShown: false,
        }}
      />
      {/* Screens phase has been moved to its own siloed group: app/(screens)/new-job/ */}
      {/* for better modular separation between walls documentation and screen-specific control. */}
      <Stack.Screen
        name="final"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          headerShown: false,
          headerLeft: () => null,
        }}
      />
    </Stack>
  );
}
