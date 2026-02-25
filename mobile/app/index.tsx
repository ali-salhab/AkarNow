/**
 * App Entry Point
 * Decides where to route based on auth & onboarding state
 */

import { Redirect } from "expo-router";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
