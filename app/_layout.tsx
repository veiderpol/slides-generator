import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { initDb } from "@/src/storage/db";
import { ActiveSessionProvider } from "@/src/session";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      setReady(true);
    })();
  }, []);

  return (
    <ActiveSessionProvider dbReady={ready}>
      <Stack screenOptions={{ headerShown: false }} />
    </ActiveSessionProvider>
  );
}
