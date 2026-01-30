import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export function initDb() {
  if (_db) return;

  _db = SQLite.openDatabaseSync("app.db");

  _db.runSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      current_route TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export function getDb() {
  if (!_db) throw new Error("DB not initialized");
  return _db;
}
