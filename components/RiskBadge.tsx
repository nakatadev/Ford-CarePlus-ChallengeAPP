import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { radius, riskColors, spacing } from '@/constants/theme';
import { tierLabel } from '@/ml/churnModel';
import { RiskTier } from '@/types';

export function RiskBadge({ tier, probability }: { tier: RiskTier; probability?: number }) {
  const c = riskColors[tier];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]} accessibilityLabel={`Risco ${tierLabel[tier]}`}>
      <View style={[styles.dot, { backgroundColor: c.fg }]} />
      <Text variant="caption" style={[styles.text, { color: c.fg }]}>
        {probability !== undefined ? `${Math.round(probability * 100)}%` : tierLabel[tier]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontFamily: 'Inter_700Bold', fontSize: 12, lineHeight: 16 },
});
