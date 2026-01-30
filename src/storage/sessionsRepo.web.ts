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

const KEY = "cinetica:sessions:v1";

function readAll(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: SessionRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function nowISO() {
  return new Date().toISOString();
}

export async function createSession(params: { id: string; name?: string; startRoute?: string }) {
  const createdAt = nowISO();
  const rec: SessionRecord = {
    id: params.id,
    name: params.name ?? "Untitled session",
    status: "draft",
    currentRoute: params.startRoute ?? "/context",
    answers: {},
    createdAt,
    updatedAt: createdAt,
  };

  const all = readAll();
  writeAll([rec, ...all.filter((s) => s.id !== rec.id)]);
  return rec;
}

export async function listSessions() {
  return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function getSession(id: string) {
  const all = readAll();
  return all.find((s) => s.id === id) ?? null;
}

export async function updateSession(
  id: string,
  patch: Partial<Omit<SessionRecord, "id" | "createdAt">>
) {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;

  const existing = all[idx];
  const next: SessionRecord = {
    ...existing,
    ...patch,
    answers: patch.answers ?? existing.answers,
    currentRoute: patch.currentRoute ?? existing.currentRoute,
    name: patch.name ?? existing.name,
    status: (patch.status as SessionStatus) ?? existing.status,
    updatedAt: nowISO(),
  };

  all[idx] = next;
  writeAll(all);
}

export async function deleteSession(id: string) {
  const all = readAll().filter((s) => s.id !== id);
  writeAll(all);
}
