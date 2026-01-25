import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "./theme";

export function GlassCard({
  children,
  style,
  intensity = 22,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}) {
  const Container: any = Platform.OS === "web" ? View : BlurView;

  return (
    <View style={[styles.outer, style]}>
      <Container
        intensity={Platform.OS === "web" ? undefined : intensity}
        tint="dark"
        style={styles.inner}
      >
        {/* Specular highlight (top-left shine) */}
        <LinearGradient
          colors={[theme.glass.highlight, "rgba(255,255,255,0.00)"]}
          start={{ x: 0.05, y: 0.05 }}
          end={{ x: 0.7, y: 0.7 }}
          style={styles.highlight}
          pointerEvents="none"
        />
        {children}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fill,
    shadowColor: theme.glass.shadow,
    shadowOpacity: 1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
    overflow: "hidden",
  },
  inner: {
    borderRadius: theme.radius.lg,
    padding: 16,
    backgroundColor: Platform.OS === "web" ? theme.glass.fill : "transparent",
  },
  highlight: {
    position: "absolute",
    top: -40,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.35,
    transform: [{ rotate: "10deg" }],
  },
});
