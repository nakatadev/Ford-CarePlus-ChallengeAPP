import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '@/components/Brand';
import { CustomerRow } from '@/components/CustomerRow';
import { BarChart, Card, ErrorState, Icon, IconName, LoadingList, SectionHeader, Text, TrendLine } from '@/components/ui';
import { colors, radius, riskColors, spacing } from '@/constants/theme';
import { dealers, vinShareHistory } from '@/data/mockData';
import { MODEL } from '@/ml/churnModel';
import { useApp } from '@/store/AppContext';
import { useAuth } from '@/store/AuthContext';
import { usePortfolio } from '@/store/hooks';
import { firstName, greeting } from '@/utils/format';

function Kpi({ icon, label, value, delta, tone = 'text' }: { icon: IconName; label: string; value: string; delta?: string; tone?: 'text' | 'danger' | 'success' | 'primary' }) {
  return (
    <Card style={styles.kpi}>
      <View style={styles.kpiHead}>
        <Icon name={icon} size={16} color="textMuted" />
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text variant="metric" color={tone}>
        {value}
      </Text>
      {delta && (
        <Text variant="caption" color="success">
          {delta}
        </Text>
      )}
    </Card>
  );
}

export default function Painel() {
  const { user } = useAuth();
  const { leads } = useApp();
  const { items, loading, error, reload } = usePortfolio();
  const dealer = dealers.find((d) => d.id === user?.dealerId) ?? dealers[0];

  const high = items?.filter((i) => i.risk.tier === 'alto') ?? [];
  const med = items?.filter((i) => i.risk.tier === 'medio') ?? [];
  const low = items?.filter((i) => i.risk.tier === 'baixo') ?? [];
  const openLeads = leads.filter((l) => l.status === 'enviado' || l.status === 'visualizado').length;
  const converted = leads.filter((l) => l.status === 'agendado').length;
  const conversion = leads.length ? Math.round((converted / leads.length) * 100) : 0;
  const vin = vinShareHistory.values[vinShareHistory.values.length - 1];
  const vinDelta = vin - vinShareHistory.values[vinShareHistory.values.length - 2];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.huge }}>
      <SafeAreaView edges={['top']} style={styles.hero}>
        <Wordmark compact />
        <View style={{ gap: 2 }}>
          <Text variant="label" color="textOnBrandMuted">
            {greeting()}, {firstName(user?.name ?? '')}
          </Text>
          <Text variant="title" color="textOnBrand">
            Cockpit · {dealer.name}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <View style={styles.kpis}>
          <Kpi icon="speedometer-outline" label="VIN Share" value={`${vin.toFixed(1).replace('.', ',')}%`} delta={`▲ ${vinDelta.toFixed(1).replace('.', ',')} p.p. no mês`} tone="primary" />
          <Kpi icon="warning-outline" label="Clientes em alto risco" value={loading ? '—' : String(high.length)} tone="danger" />
          <Kpi icon="funnel-outline" label="Leads em aberto" value={String(openLeads)} />
          <Kpi icon="trending-up-outline" label="Conversão de leads" value={`${conversion}%`} tone={conversion >= 35 ? 'success' : 'text'} />
        </View>

        <Card>
          <View style={styles.rowBetween}>
            <Text variant="heading">VIN Share · 6 meses</Text>
            <Text variant="caption" color="success">
              meta {vinShareHistory.target}%
            </Text>
          </View>
          <View style={{ marginTop: spacing.md }}>
            <TrendLine values={vinShareHistory.values} labels={vinShareHistory.labels} target={vinShareHistory.target} height={120} />
          </View>
        </Card>

        {loading ? (
          <LoadingList count={2} />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <Card>
              <Text variant="heading">Carteira por risco de evasão</Text>
              <Text variant="caption" color="textMuted" style={{ marginBottom: spacing.lg }}>
                Modelo de ML v{MODEL.version} · {items?.length} clientes
              </Text>
              <BarChart
                data={[
                  { label: 'Baixo', value: low.length, color: riskColors.baixo.fg },
                  { label: 'Médio', value: med.length, color: riskColors.medio.fg },
                  { label: 'Alto', value: high.length, color: riskColors.alto.fg },
                ]}
                height={110}
              />
            </Card>

            <SectionHeader title="Prioridades de hoje" action="Ver todos" onAction={() => router.push('/clientes')} />
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {items?.slice(0, 5).map((c, i) => (
                <CustomerRow key={c.id} item={c} first={i === 0} />
              ))}
            </Card>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brand, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, paddingTop: spacing.md, gap: spacing.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  body: { padding: spacing.xl, gap: spacing.lg },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpi: { flexBasis: '47%', flexGrow: 1, gap: 2 },
  kpiHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
