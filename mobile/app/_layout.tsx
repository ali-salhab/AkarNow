/**
 * Root Layout
 * Handles app initialization, font loading, and auth routing
 */

import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { I18nManager } from "react-native";
import { useAuthStore } from "../store/authStore";
import AppSplash from "../components/AppSplash";
import "../global.css";

// Force RTL for Arabic
I18nManager.forceRTL(true);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const MIN_SPLASH_MS = 1500;

export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    initialize().finally(() => {
      SplashScreen.hideAsync();
    });
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !minTimeElapsed) {
    return (
      <>
        <StatusBar style="light" />
        <AppSplash />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="property/[id]"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}
