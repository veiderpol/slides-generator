import { Platform } from "react-native";
import type { SQLiteDatabase } from "expo-sqlite";

type NativeDbModule = {
  initDb: () => void | Promise<void>;
  getDb: () => SQLiteDatabase;
};

export async function initDb() {
  if (Platform.OS === "web") return;
  const native = require("./db.native") as NativeDbModule;
  await native.initDb();
}

export function getDb(): SQLiteDatabase {
  if (Platform.OS === "web") {
    throw new Error("SQLite DB is not available on web. Use sessionsRepo.web.ts instead.");
  }
  const native = require("./db.native") as NativeDbModule;
  return native.getDb();
}
