import { useEffect } from "react";
import { router } from "expo-router";
import { useActiveSession } from "./ActiveSessionProvider";

export function useRequireSession(currentRoute?: string) {
  const { session, setCurrentRoute } = useActiveSession();

  useEffect(() => {
    if (!session) {
      router.replace("/sessions");
      return;
    }
    if (currentRoute) setCurrentRoute(currentRoute);
  }, [session, currentRoute, setCurrentRoute]);

  return session;
}
