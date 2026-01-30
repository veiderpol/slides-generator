import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SessionRecord } from "@/src/storage/sessionsRepo";
import { getSession, updateSession } from "@/src/storage/sessionsRepo";
import { initDb } from "@/src/storage/db";
import { makeEmptyTemplate } from "@/src/session/template";

export type Ctx = {
  session: SessionRecord | null;
  dbReady: boolean;
  loadSession: (id: string) => Promise<void>;
  setAnswer: (key: string, value: any) => Promise<void>;
  setCurrentRoute: (route: string) => Promise<void>;
  renameSession: (name: string) => Promise<void>;
};

export const ActiveSessionContext = createContext<Ctx | null>(null);
function setDeep(obj: any, path: string, value: any) {
  const parts = path.split(".");
  const root = { ...(obj ?? {}) };
  let cur = root;

  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];

    if (i === parts.length - 1) {
      cur[k] = value;
    } else {
      const next = cur[k];
      cur[k] = typeof next === "object" && next !== null && !Array.isArray(next) ? { ...next } : {};
      cur = cur[k];
    }
  }

  return root;
}

export function ActiveSessionProvider({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const [session, setSession] = useState<SessionRecord | null>(null);

  // Initialize DB once (web async-safe)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await initDb();
        if (mounted) setDbReady(true);
      } catch (e) {
        console.error("initDb failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const ctx = useMemo<Ctx>(() => ({
    session,
    dbReady,

    loadSession: async (id) => {
      if (!dbReady) return;
      const s = await getSession(id);

      if (!s) {
        setSession(null);
        return;
      }

      // If answers missing, just initialize to template (no migration of old keys)
      const nextAnswers = s.answers ?? makeEmptyTemplate();
      setSession({ ...s, answers: nextAnswers });
    },


    setAnswer: async (key, value) => {
      if (!dbReady || !session) return;

      const nextAnswers = setDeep(session.answers, key, value);
      const next = { ...session, answers: nextAnswers };

      setSession(next);

      try {
        await updateSession(session.id, { answers: nextAnswers });
      } catch (e) {
        console.error("updateSession(setAnswer) failed:", e);
      }
    },
    setCurrentRoute: async (route) => {
      if (!dbReady || !session) return;

      setSession({ ...session, currentRoute: route });

      try {
        await updateSession(session.id, { currentRoute: route });
      } catch (e) {
        console.error("updateSession(setCurrentRoute) failed:", e);
      }
    },

    renameSession: async (name) => {
      if (!dbReady || !session) return;

      setSession({ ...session, name });

      try {
        await updateSession(session.id, { name });
      } catch (e) {
        console.error("updateSession(renameSession) failed:", e);
      }
    },
  }), [session, dbReady]);

  return <ActiveSessionContext.Provider value={ctx}>{children}</ActiveSessionContext.Provider>;
}

export function useActiveSession() {
  const v = useContext(ActiveSessionContext);
  if (!v) throw new Error("useActiveSession must be used within ActiveSessionProvider");
  return v;
}
