import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
