import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "./theme";

export function GlassInput({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.wrap}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={theme.text.muted}
          style={[styles.input, multiline && styles.multiline]}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: theme.text.secondary, fontSize: 12, fontWeight: "800" },
  wrap: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fill,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: { color: theme.text.primary, fontSize: 14 },
  multiline: { minHeight: 90, textAlignVertical: "top" as any },
});
