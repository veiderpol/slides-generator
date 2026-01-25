import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "./theme";

export function GlassScreen({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      {/* Base background */}
      <LinearGradient
        colors={[theme.bg.base, theme.bg.base2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft “spotlight” glow */}
      <LinearGradient
        colors={["rgba(120,170,255,0.16)", "rgba(120,170,255,0.00)"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.7, y: 0.7 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.9 }]}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  content: { flex: 1, padding: 18 },
});
