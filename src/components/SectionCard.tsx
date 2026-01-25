import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { GlassCard } from "./GlassCard";
import {theme} from "./theme";

export function SectionCard({
  title,
  children,
  style,
}: {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <GlassCard style={style}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ marginTop: 10 }}>{children}</View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
});
