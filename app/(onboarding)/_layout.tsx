import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" options={{ animation: 'none' }} />
      <Stack.Screen name="welcome" options={{ animation: 'none' }} />
      <Stack.Screen name="sign-in" options={{ animation: 'none' }} />
      <Stack.Screen name="location" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
