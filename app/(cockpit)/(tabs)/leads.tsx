import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Badge, BadgeTone, Card, EmptyState, Icon, IconName, Screen, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { customers } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import { LeadStatus } from '@/types';
import { timeAgo } from '@/utils/format';

const statusMeta: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  enviado: { label: 'Enviado', tone: 'neutral' },
  visualizado: { label: 'Visualizado', tone: 'primary' },
  agendado: { label: 'Agendado', tone: 'success' },
  perdido: { label: 'Perdido', tone: 'danger' },
};

const channelIcon: Record<string, IconName> = { app: 'phone-portrait-outline', whatsapp: 'logo-whatsapp', ligacao: 'call-outline' };

export default function Leads() {
  const { leads } = useApp();
  const stages: LeadStatus[] = ['enviado', 'visualizado', 'agendado', 'perdido'];
  const nameOf = (id: string) => (id === 'c-001' ? 'Gabriel Padula' : customers.find((c) => c.id === id)?.name ?? id);

  return (
    <Screen>
      <View>
        <Text variant="title">Leads</Text>
        <Text variant="caption" color="textMuted">
          Funil das ações enviadas pelo cockpit
        </Text>
      </View>

      <View style={styles.funnel}>
        {stages.map((s) => (
          <Card key={s} style={styles.stage}>
            <Text variant="title" color={s === 'agendado' ? 'success' : s === 'perdido' ? 'danger' : 'text'}>
              {leads.filter((l) => l.status === s).length}
            </Text>
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {statusMeta[s].label}
            </Text>
          </Card>
        ))}
      </View>

      {leads.length === 0 ? (
        <Card>
          <EmptyState
            icon="funnel-outline"
            title="Nenhum lead ainda"
            description="Abra um cliente em risco e envie uma oferta. O status é atualizado quando o cliente visualiza ou agenda pelo app."
            actionLabel="Ver clientes em risco"
            onAction={() => router.push('/clientes')}
          />
        </Card>
      ) : (
        <Card padded={false} style={{ overflow: 'hidden' }}>
          {leads.map((l, i) => (
            <View key={l.id} style={[styles.row, i > 0 && styles.sep]} testID={`lead-${i}`}>
              <View style={styles.icon}>
                <Icon name={channelIcon[l.channel]} size={18} color="brand" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {nameOf(l.customerId)}
                </Text>
                <Text variant="caption" color="textMuted" numberOfLines={1}>
                  {l.title} · {timeAgo(l.createdAt)}
                </Text>
              </View>
              <Badge label={statusMeta[l.status].label} tone={statusMeta[l.status].tone} />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  funnel: { flexDirection: 'row', gap: spacing.sm },
  stage: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  sep: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
});
