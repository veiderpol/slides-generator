import React from "react";
import { View, useWindowDimensions } from "react-native";

export function Grid({
  children,
  minColWidth = 520,
  gap = 16,
}: {
  children: React.ReactNode;
  minColWidth?: number;
  gap?: number;
}) {
  const { width } = useWindowDimensions();
  const cols = width >= minColWidth * 2 ? 2 : 1;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -gap / 2 }}>
      {React.Children.map(children, (child) => (
        <View style={{ width: cols === 2 ? "50%" : "100%", paddingHorizontal: gap / 2, paddingVertical: gap / 2 }}>
          {child}
        </View>
      ))}
    </View>
  );
}
