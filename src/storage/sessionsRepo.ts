import { db } from "@/src/storage/db";

export type SessionStatus = "draft" | "generated";

export type SessionRecord = {
  id: string;
  name: string;
  status: SessionStatus;
  currentRoute: string;
  answers: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

function nowISO() {
  return new Date().toISOString();
}

export function createSession(params: { id: string; name?: string; startRoute?: string }): SessionRecord {
  const createdAt = nowISO();
  const updatedAt = createdAt;

  const rec: SessionRecord = {
    id: params.id,
    name: params.name ?? "Untitled session",
    status: "draft",
    currentRoute: params.startRoute ?? "/context/step-1",
    answers: {},
    createdAt,
    updatedAt,
  };

  db.runSync(
    `INSERT INTO sessions (id, name, status, current_route, answers_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [rec.id, rec.name, rec.status, rec.currentRoute, JSON.stringify(rec.answers), rec.createdAt, rec.updatedAt]
  );

  return rec;
}

export function listSessions(): SessionRecord[] {
  const rows = db.getAllSync<any>(`SELECT * FROM sessions ORDER BY updated_at DESC`);
  return rows.map(rowToSession);
}

export function getSession(id: string): SessionRecord | null {
  const row = db.getFirstSync<any>(`SELECT * FROM sessions WHERE id = ?`, [id]);
  return row ? rowToSession(row) : null;
}

export function updateSession(id: string, patch: Partial<Omit<SessionRecord, "id" | "createdAt">>) {
  const existing = getSession(id);
  if (!existing) return;

  const next: SessionRecord = {
    ...existing,
    ...patch,
    answers: patch.answers ?? existing.answers,
    currentRoute: patch.currentRoute ?? existing.currentRoute,
    name: patch.name ?? existing.name,
    status: (patch.status as any) ?? existing.status,
    updatedAt: nowISO(),
  };

  db.runSync(
    `UPDATE sessions
     SET name = ?, status = ?, current_route = ?, answers_json = ?, updated_at = ?
     WHERE id = ?`,
    [next.name, next.status, next.currentRoute, JSON.stringify(next.answers), next.updatedAt, id]
  );
}

export function deleteSession(id: string) {
  db.runSync(`DELETE FROM sessions WHERE id = ?`, [id]);
}

function rowToSession(row: any): SessionRecord {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    currentRoute: row.current_route,
    answers: safeJson(row.answers_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJson(s: string): any {
  try { return JSON.parse(s); } catch { return {}; }
}
