import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { GlassScreen, GlassCard, GlassButton, theme } from "@/src/components/";
import { router } from "expo-router";

export default function Dashboard() {
  return (
    <GlassScreen>
      <Text style={styles.h1}>Slides Generator</Text>

      <View style={{ gap: 12, marginTop: 12 }}>
        <GlassCard>
          <Text style={styles.cardTitle}>Quick actions</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <GlassButton label="Sessions" onPress={() => router.push("/sessions")} />
            <GlassButton label="Start" onPress={() => router.push("/context/index")} />
          </View>
        </GlassCard>
      </View>
    </GlassScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: "900", color: theme.text.primary },
  sub: { marginTop: 6, color: theme.text.secondary },
  cardTitle: { color: theme.text.primary, fontWeight: "900", fontSize: 14 },
});
