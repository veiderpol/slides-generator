import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { SectionCard } from "@/src/components/SectionCard";
import { ActiveSessionProvider, useActiveSession } from "@/src/session";
import { useRequireSession } from "@/src/session";

const OPTIONS = ["Evento", "Interactivo", "Contenido", "Ambos"] as const;

export default function ContextStep1() {
  const session = useRequireSession("/context/step-1");
  const { session: active, setAnswer } = useActiveSession();

  // If redirecting, render nothing
  if (!session || !active) return null;

  const selected = (active.answers["context.mode"] as string) ?? "";

  return (
    <View style={styles.page}>
      <Text style={styles.h1}>1. Contexto</Text>
      <Text style={styles.meta}>Selecciona una opción</Text>

      <SectionCard title="Tipo de experiencia">
        <View style={{ gap: 10, marginTop: 10 }}>
          {OPTIONS.map((opt) => {
            const isActive = selected === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => setAnswer("context.mode", opt)}
                style={[styles.option, isActive && styles.optionActive]}
              >
                <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryBtn} onPress={() => router.push("/sessions")}>
          <Text style={styles.secondaryBtnText}>Back to Sessions</Text>
        </Pressable>

        <Pressable
          style={[styles.primaryBtn, !selected && styles.primaryBtnDisabled]}
          disabled={!selected}
          onPress={() => router.push("/context/step-2")}
        >
          <Text style={styles.primaryBtnText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 18, backgroundColor: "#f3f4f6", gap: 12 },
  h1: { fontSize: 22, fontWeight: "900" },
  meta: { color: "#6b7280", marginTop: -6, marginBottom: 8, fontSize: 12 },

  option: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "white",
  },
  optionActive: { borderColor: "#111827" },
  optionText: { fontWeight: "800" },
  optionTextActive: { color: "#111827" },

  footer: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: "auto" },

  primaryBtn: { backgroundColor: "#111827", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: "white", fontWeight: "900" },

  secondaryBtn: { backgroundColor: "white", borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  secondaryBtnText: { fontWeight: "900" },
});
