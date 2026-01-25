import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { initDb } from "@/src/storage/db";
import { ActiveSessionProvider } from "@/src/session";

export default function RootLayout() {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <ActiveSessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ActiveSessionProvider>
  );
}
