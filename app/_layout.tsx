import '../styles/global.css';

import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from '@expo-google-fonts/source-serif-4';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { MeProvider, useMe } from '@/lib/MeContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { me, loading: meLoading } = useMe();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !userLoaded || meLoading) return;

    const screen       = segments[1] ?? '';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isSignedIn) {
      if (!inOnboarding) router.replace('/(onboarding)/splash');
      return;
    }

    const hasName = !!user?.firstName;
    const hasHome = me?.home_lat != null;

    if (!hasName) {
      // Step 1 incomplete — collect name + username
      if (screen !== 'complete-profile') {
        router.replace('/(onboarding)/complete-profile' as any);
      }
    } else if (!hasHome) {
      // Step 2 incomplete — set home neighbourhood
      if (screen !== 'location') {
        router.replace('/(onboarding)/location' as any);
      }
    } else {
      // Fully onboarded — bounce off any remaining onboarding screen
      if (inOnboarding) {
        router.replace('/(tabs)');
      }
    }
  }, [isSignedIn, isLoaded, userLoaded, meLoading, segments, user?.firstName, me?.home_lat]);

  // Keep onboarding screens visible during the me fetch so async Clerk operations
  // (setActive, user.update) in complete-profile aren't interrupted by unmounting.
  const inOnboarding = segments[0] === '(onboarding)';
  if (!isLoaded || !userLoaded || (isSignedIn && meLoading && !inOnboarding)) {
    return <View style={{ flex: 1, backgroundColor: '#FBF8F2' }} />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env — check your .env file'
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <MeProvider>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="add-book" />
              <Stack.Screen name="listing" />
              <Stack.Screen name="chat/[loanId]" />
              <Stack.Screen name="loan/[id]" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </AuthGuard>
        </MeProvider>
        <StatusBar style="dark" backgroundColor="#FBF8F2" />
      </ThemeProvider>
    </ClerkProvider>
  );
}
