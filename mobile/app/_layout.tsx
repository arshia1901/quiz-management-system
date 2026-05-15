/**
 * mobile/app/_layout.tsx
 * Root layout — wraps entire app in AuthProvider and handles auth redirects.
 */

import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../src/store";
import { LoadingScreen } from "../src/components";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inStudentGroup = segments[0] === "(student)";
    const inTeacherGroup = segments[0] === "(teacher)";

    if (!user) {
      // Not logged in — go to login
      if (!inAuthGroup) router.replace("/(auth)/login");
    } else {
      // Logged in — redirect to correct role group
      if (inAuthGroup || (!inStudentGroup && !inTeacherGroup)) {
        if (user.role === "STUDENT") {
          router.replace("/(student)/dashboard");
        } else {
          router.replace("/(teacher)/dashboard");
        }
      }
    }
  }, [user, loading, segments]);

  if (loading) return <LoadingScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(teacher)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#0f0f13" />
      <RootLayoutNav />
    </AuthProvider>
  );
}
