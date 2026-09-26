import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Badge, Text } from '@/components/ui';
import { colors, radius, riskColors, spacing } from '@/constants/theme';
import { PortfolioItem } from '@/store/hooks';
import { initials } from '@/utils/format';
import { RiskBadge } from './RiskBadge';

export function CustomerRow({ item, first }: { item: PortfolioItem; first?: boolean }) {
  const c = riskColors[item.risk.tier];
  return (
    <Pressable
      testID={`customer-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, risco ${Math.round(item.risk.probability * 100)}%`}
      onPress={() => router.push(`/cliente/${item.id}`)}
      style={({ pressed }) => [styles.row, !first && styles.sep, pressed && { backgroundColor: colors.surfaceMuted }]}
    >
      <View style={[styles.avatar, { backgroundColor: c.bg }]}>
        <Text variant="label" style={{ color: c.fg }}>
          {initials(item.name)}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
            {item.name}
          </Text>
          {item.isAppUser && <Badge label="App" tone="primary" />}
        </View>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {item.vehicle.model} {item.vehicle.version} · {item.vehicle.year}
        </Text>
      </View>
      <RiskBadge tier={item.risk.tier} probability={item.risk.probability} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  sep: { borderTopWidth: 1, borderTopColor: colors.border },
  avatar: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
