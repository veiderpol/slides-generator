import React from "react";
import { View, Text } from "react-native";

export function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 16,
        gap: 12,
      }}
    >
      <Text style={{ color: "white", fontWeight: "900", opacity: 0.9 }}>{title}</Text>
      {children}
    </View>
  );
}
