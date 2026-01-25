const KEY = "slides_generator:sessions_v1";

type Row = {
  id: string;
  name: string;
  status: string;
  current_route: string;
  answers_json: string;
  created_at: string;
  updated_at: string;
};

function readAll(): Row[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Row[]) : [];
  } catch {
    return [];
  }
}

function writeAll(rows: Row[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

// Minimal “db-like” API used by sessionsRepo
export const db = {
  execSync(_sql: string) {
    // no-op on web
  },
  runSync(sql: string, params: any[]) {
    // We implement just what sessionsRepo uses.
    const rows = readAll();

    if (sql.startsWith("INSERT INTO sessions")) {
      const [id, name, status, current_route, answers_json, created_at, updated_at] = params;
      rows.push({ id, name, status, current_route, answers_json, created_at, updated_at });
      writeAll(rows);
      return;
    }

    if (sql.startsWith("UPDATE sessions")) {
      const [name, status, current_route, answers_json, updated_at, id] = params;
      const i = rows.findIndex(r => r.id === id);
      if (i >= 0) {
        rows[i] = { ...rows[i], name, status, current_route, answers_json, updated_at };
        writeAll(rows);
      }
      return;
    }

    if (sql.startsWith("DELETE FROM sessions")) {
      const [id] = params;
      writeAll(rows.filter(r => r.id !== id));
      return;
    }

    throw new Error(`db.web: Unsupported SQL: ${sql}`);
  },
  getAllSync<T>(_sql: string) {
    // SELECT * FROM sessions ORDER BY updated_at DESC
    const rows = readAll().sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
    return rows as any as T[];
  },
  getFirstSync<T>(_sql: string, params: any[]) {
    // SELECT * FROM sessions WHERE id = ?
    const [id] = params;
    const row = readAll().find(r => r.id === id);
    return (row ?? null) as any as T;
  },
};

export function initDb() {
  // no-op on web
}
