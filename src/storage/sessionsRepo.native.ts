import { getDb } from "@/src/storage/db";

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

type SessionRow = {
  id: string;
  name: string;
  status: SessionStatus;
  current_route: string;
  answers_json: string;
  created_at: string;
  updated_at: string;
};

function nowISO() {
  return new Date().toISOString();
}

export async function createSession(params: {
  id: string;
  name?: string;
  startRoute?: string;
}): Promise<SessionRecord> {
  const createdAt = nowISO();
  const updatedAt = createdAt;

  const rec: SessionRecord = {
    id: params.id,
    name: params.name ?? "Untitled session",
    status: "draft",
    currentRoute: params.startRoute ?? "/context/index",
    answers: {},
    createdAt,
    updatedAt,
  };

  await getDb().runAsync(
    `INSERT INTO sessions (id, name, status, current_route, answers_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      rec.id,
      rec.name,
      rec.status,
      rec.currentRoute,
      JSON.stringify(rec.answers),
      rec.createdAt,
      rec.updatedAt,
    ]
  );

  return rec;
}

export async function listSessions(): Promise<SessionRecord[]> {
  const rows = await getDb().getAllAsync<SessionRow>(
    `SELECT * FROM sessions ORDER BY updated_at DESC`
  );
  return rows.map(rowToSession);
}

export async function getSession(id: string): Promise<SessionRecord | null> {
  const row = await getDb().getFirstAsync<SessionRow>(
    `SELECT * FROM sessions WHERE id = ?`,
    [id]
  );
  return row ? rowToSession(row) : null;
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<SessionRecord, "id" | "createdAt">>
): Promise<void> {
  const existing = await getSession(id);
  if (!existing) return;

  const next: SessionRecord = {
    ...existing,
    ...patch,
    answers: patch.answers ?? existing.answers,
    currentRoute: patch.currentRoute ?? existing.currentRoute,
    name: patch.name ?? existing.name,
    status: (patch.status as SessionStatus) ?? existing.status,
    updatedAt: nowISO(),
  };

  await getDb().runAsync(
    `UPDATE sessions
     SET name = ?, status = ?, current_route = ?, answers_json = ?, updated_at = ?
     WHERE id = ?`,
    [
      next.name,
      next.status,
      next.currentRoute,
      JSON.stringify(next.answers),
      next.updatedAt,
      id,
    ]
  );
}

export async function deleteSession(id: string): Promise<void> {
  await getDb().runAsync(`DELETE FROM sessions WHERE id = ?`, [id]);
}

function rowToSession(row: SessionRow): SessionRecord {
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
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
