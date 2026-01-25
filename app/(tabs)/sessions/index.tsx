import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { v4 as uuidv4 } from "uuid";
import "react-native-get-random-values";

import { SectionCard, SearchBar} from "@/src/components";
import { useActiveSession } from "@/src/session";
import { createSession, deleteSession, listSessions, updateSession, type SessionRecord } from "@/src/storage";

export default function SessionsScreen() {
  const { loadSession } = useActiveSession();

  const [q, setQ] = useState("");
  const [rows, setRows] = useState<SessionRecord[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const refresh = useCallback(() => {
    setRows(listSessions());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => (r.name + " " + r.status + " " + r.id).toLowerCase().includes(s));
  }, [q, rows]);

  const onNewSession = () => {
    const id = uuidv4();
    createSession({ id, name: "Untitled session", startRoute: "/context/step-1" });
    loadSession(id);
    refresh();
    router.push("/context/step-1");
  };

  const onResume = (sess: SessionRecord) => {
    loadSession(sess.id);
    router.push(sess.currentRoute as any);
  };

  const onStartRename = (sess: SessionRecord) => {
    setRenamingId(sess.id);
    setRenameValue(sess.name);
  };

  const onCommitRename = () => {
    if (!renamingId) return;
    const name = renameValue.trim() || "Untitled session";
    updateSession(renamingId, { name });
    setRenamingId(null);
    setRenameValue("");
    refresh();
  };

  const onDelete = (sess: SessionRecord) => {
    Alert.alert("Delete session?", `"${sess.name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteSession(sess.id);
          refresh();
        },
      },
    ]);
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.h1}>Sessions</Text>
        <Pressable style={styles.primaryBtn} onPress={onNewSession}>
          <Text style={styles.primaryBtnText}>New session</Text>
        </Pressable>
      </View>

      <SearchBar value={q} onChange={setQ} placeholder="Search sessions…" />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 12, marginTop: 12 }}>
          {filtered.map((s) => (
            <SectionCard key={s.id} title={s.name}>
              <Text style={styles.meta}>
                {s.status.toUpperCase()} • Updated {formatDate(s.updatedAt)} • {s.id.slice(0, 8)}
              </Text>

              {renamingId === s.id ? (
                <View style={{ marginTop: 10, gap: 8 }}>
                  <TextInput
                    value={renameValue}
                    onChangeText={setRenameValue}
                    style={styles.input}
                    placeholder="Session name"
                    autoFocus
                    onSubmitEditing={onCommitRename}
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable style={styles.secondaryBtn} onPress={() => { setRenamingId(null); setRenameValue(""); }}>
                      <Text style={styles.secondaryBtnText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.primaryBtn} onPress={onCommitRename}>
                      <Text style={styles.primaryBtnText}>Save</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <Pressable style={styles.primaryBtn} onPress={() => onResume(s)}>
                    <Text style={styles.primaryBtnText}>Resume</Text>
                  </Pressable>
                  <Pressable style={styles.secondaryBtn} onPress={() => onStartRename(s)}>
                    <Text style={styles.secondaryBtnText}>Rename</Text>
                  </Pressable>
                  <Pressable style={styles.dangerBtn} onPress={() => onDelete(s)}>
                    <Text style={styles.dangerBtnText}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </SectionCard>
          ))}

          {filtered.length === 0 ? (
            <Text style={styles.meta}>No sessions yet. Create one with “New session”.</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 18, backgroundColor: "#f3f4f6", gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  h1: { fontSize: 22, fontWeight: "900" },
  meta: { color: "#6b7280", marginTop: 6, fontSize: 12 },

  primaryBtn: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  primaryBtnText: { color: "white", fontWeight: "900" },

  secondaryBtn: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  secondaryBtnText: { fontWeight: "900" },

  dangerBtn: { backgroundColor: "white", borderWidth: 1, borderColor: "#fecaca", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12 },
  dangerBtnText: { fontWeight: "900" },

  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: "white" },
});
