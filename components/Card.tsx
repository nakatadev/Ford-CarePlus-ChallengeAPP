import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/theme";

export function Card({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.accent]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2
  },
  accent: {
    borderColor: "#B9D8F2",
    backgroundColor: "#F2F8FD"
  }
});
