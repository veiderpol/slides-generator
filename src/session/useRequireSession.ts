import { useEffect } from "react";
import { router, useRootNavigationState, usePathname } from "expo-router";
import { useActiveSession } from "@/src/session";

export function useRequireSession() {
  const nav = useRootNavigationState();
  const pathname = usePathname();
  const { session, dbReady } = useActiveSession();

  const navReady = !!nav?.key;

  useEffect(() => {
    // wait for router to mount AND db to be ready
    if (!navReady || !dbReady) return;

    // if no active session, go to sessions list
    if (!session) {
      router.replace("/sessions");
    }
  }, [navReady, dbReady, session, pathname]);

  return session;
}
