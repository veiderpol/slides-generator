import React, { createContext, useContext, useMemo, useState } from "react";
import type { SessionRecord } from "@/src/storage/sessionsRepo";
import { getSession, updateSession } from "@/src//storage/sessionsRepo";

export type Ctx = {
  session: SessionRecord | null;
  loadSession: (id: string) => void;
  setAnswer: (key: string, value: any) => void;
  setCurrentRoute: (route: string) => void;
  renameSession: (name: string) => void;
};

export const ActiveSessionContext = createContext<Ctx | null>(null);

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionRecord | null>(null);

  const ctx = useMemo<Ctx>(() => ({
    session,
    loadSession: (id) => {
      const s = getSession(id);
      setSession(s);
    },
    setAnswer: (key, value) => {
      if (!session) return;
      const nextAnswers = { ...session.answers, [key]: value };
      const next = { ...session, answers: nextAnswers };
      setSession(next);
      updateSession(session.id, { answers: nextAnswers });
    },
    setCurrentRoute: (route) => {
      if (!session) return;
      setSession({ ...session, currentRoute: route });
      updateSession(session.id, { currentRoute: route });
    },
    renameSession: (name) => {
      if (!session) return;
      setSession({ ...session, name });
      updateSession(session.id, { name });
    },
  }), [session]);

  return <ActiveSessionContext.Provider value={ctx}>{children}</ActiveSessionContext.Provider>;
}

export function useActiveSession() {
  const v = useContext(ActiveSessionContext);
  if (!v) throw new Error("useActiveSession must be used within ActiveSessionProvider");
  return v;
}
