import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { RiskBadge } from '@/components/RiskBadge';
import { Button, Card, ChipGroup, ContributionBars, Dialog, EmptyState, ErrorState, Icon, IconName, Input, KeyValue, LoadingList, RiskGauge, Screen, ScreenHeader, SectionHeader, Text, useToast } from '@/components/ui';
import { colors, radius, riskColors, spacing } from '@/constants/theme';
import { tierLabel } from '@/ml/churnModel';
import { useApp } from '@/store/AppContext';
import { usePortfolio } from '@/store/hooks';
import { FeedbackEventType, LeadChannel } from '@/types';
import { formatDate, formatKm, timeAgo } from '@/utils/format';

const templates = [
  { value: 'rev15', label: 'Revisão 15% off', title: 'Revisão com 15% de desconto', serviceId: 'revisao', discountPct: 15 },
  { value: 'oleo20', label: 'Óleo 20% off', title: 'Troca de óleo com 20% de desconto', serviceId: 'oil-filter', discountPct: 20 },
  { value: 'diag', label: 'Diagnóstico grátis', title: 'Diagnóstico eletrônico gratuito', serviceId: 'diagnostic', discountPct: 100 },
] as const;
type TemplateKey = (typeof templates)[number]['value'];

const eventMeta: Record<FeedbackEventType, { icon: IconName; label: string; color: string }> = {
  oferta_enviada: { icon: 'paper-plane', label: 'Oferta enviada', color: colors.primary },
  oferta_vista: { icon: 'eye', label: 'Oferta visualizada', color: colors.primary },
  oferta_aceita: { icon: 'checkmark-circle', label: 'Oferta aceita', color: colors.success },
  oferta_recusada: { icon: 'close-circle', label: 'Oferta recusada', color: colors.danger },
  agendamento: { icon: 'calendar', label: 'Agendou serviço', color: colors.success },
  cancelamento: { icon: 'calendar-clear', label: 'Cancelou serviço', color: colors.danger },
  contato: { icon: 'chatbubbles', label: 'Contato registrado', color: colors.textMuted },
};

export default function CustomerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, loading, error, reload } = usePortfolio();
  const { events, sendDealerOffer, registerContact } = useApp();
  const toast = useToast();
  const [dialog, setDialog] = useState<null | 'offer' | 'contact'>(null);
  const [tpl, setTpl] = useState<TemplateKey>('rev15');
  const [channel, setChannel] = useState<LeadChannel>('app');
  const [note, setNote] = useState('');

  const c = items?.find((i) => i.id === id);

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Cliente" />
        <LoadingList count={3} />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen>
        <ScreenHeader title="Cliente" />
        <ErrorState message={error} onRetry={reload} />
      </Screen>
    );
  }
  if (!c) {
    return (
      <Screen>
        <ScreenHeader title="Cliente" />
        <EmptyState icon="person-outline" title="Cliente não encontrado" actionLabel="Voltar" onAction={() => router.back()} />
      </Screen>
    );
  }

  const rc = riskColors[c.risk.tier];
  const history = events.filter((e) => e.customerId === c.id);

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <Button label="Registrar" icon="create-outline" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => {
              setChannel('ligacao');
              setDialog('contact');
            }}
          />
          <Button label="Enviar oferta" icon="paper-plane-outline" fullWidth={false} style={{ flex: 1 }} onPress={() => {
              setChannel(c.isAppUser ? 'app' : 'whatsapp');
              setDialog('offer');
            }}
            testID="send-offer" />
        </View>
      }
    >
      <ScreenHeader title={c.name} subtitle={`${c.vehicle.model} ${c.vehicle.version} · ${c.city}`} />

      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <RiskGauge value={c.risk.probability} color={rc.fg} size={220} />
        <View style={styles.inline}>
          <RiskBadge tier={c.risk.tier} />
          <Text variant="caption" color="textMuted">
            Risco {tierLabel[c.risk.tier].toLowerCase()} de evasão da rede
          </Text>
        </View>
      </Card>

      <Card tone="primary" style={styles.action}>
        <Icon name="flash" size={20} color="primary" />
        <View style={{ flex: 1 }}>
          <Text variant="label" color="textSecondary">
            Próxima melhor ação
          </Text>
          <Text variant="bodyStrong">{c.risk.recommendedAction}</Text>
        </View>
      </Card>

      <SectionHeader title="Por que esse risco?" />
      <Card>
        <ContributionBars items={c.risk.factors.slice(0, 5).map((f) => ({ label: f.label, value: f.contribution, detail: f.detail }))} />
      </Card>

      <SectionHeader title="Veículo e contato" />
      <Card style={{ gap: spacing.xs }}>
        <KeyValue icon="car-sport-outline" label="Veículo" value={`${c.vehicle.model} ${c.vehicle.year}`} />
        <KeyValue icon="speedometer-outline" label="Quilometragem" value={formatKm(c.vehicle.mileage)} />
        <KeyValue icon="pricetag-outline" label="Placa" value={c.vehicle.plate} />
        <KeyValue icon="time-outline" label="Última visita" value={formatDate(c.lastVisit)} />
        <KeyValue icon="call-outline" label="Telefone" value={c.phone} />
        <KeyValue icon="phone-portrait-outline" label="Usa o app" value={c.isAppUser ? 'Sim' : 'Não'} />
      </Card>

      <SectionHeader title="Histórico de interações" />
      {history.length === 0 ? (
        <Card>
          <Text variant="caption" color="textMuted">
            Nenhuma interação registrada. As ações do consultor e do cliente no app aparecem aqui e retroalimentam o modelo.
          </Text>
        </Card>
      ) : (
        <Card style={{ gap: spacing.md }} testID="timeline">
          {history.map((e) => {
            const m = eventMeta[e.type];
            return (
              <View key={e.id} style={styles.event}>
                <View style={[styles.eventIcon, { backgroundColor: m.color }]}>
                  <Icon name={m.icon} size={14} color="textOnBrand" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label">{m.label}</Text>
                  <Text variant="caption" color="textMuted">
                    {e.detail} · {timeAgo(e.at)}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* ---------- Enviar oferta ---------- */}
      <Dialog
        visible={dialog === 'offer'}
        icon="paper-plane"
        title="Enviar oferta"
        message={`Para ${c.name.split(' ')[0]}. ${c.isAppUser ? 'Chega no app em tempo real.' : 'Cliente sem app: use WhatsApp ou ligação.'}`}
        confirmLabel="Enviar"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          const t = templates.find((x) => x.value === tpl)!;
          sendDealerOffer({ customerId: c.id, title: t.title, serviceId: t.serviceId, discountPct: t.discountPct, channel });
          setDialog(null);
          if (channel === 'whatsapp') Linking.openURL(`https://wa.me/55${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${c.name.split(' ')[0]}! ${t.title} na rede Ford. Posso agendar para você?`)}`).catch(() => {});
          toast('Oferta enviada · lead criado');
        }}
      >
        <View style={styles.dialogBody}>
          <Text variant="label" color="textSecondary">
            Oferta
          </Text>
          <ChipGroup<TemplateKey> scroll={false} value={tpl} onChange={setTpl} options={templates.map((t) => ({ value: t.value, label: t.label }))} />
          <Text variant="label" color="textSecondary">
            Canal
          </Text>
          <ChipGroup<LeadChannel>
            scroll={false}
            value={channel}
            onChange={setChannel}
            options={[
              ...(c.isAppUser ? [{ value: 'app' as const, label: 'App', icon: 'phone-portrait-outline' as IconName }] : []),
              { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
              { value: 'ligacao', label: 'Ligação', icon: 'call-outline' },
            ]}
          />
        </View>
      </Dialog>

      {/* ---------- Registrar contato ---------- */}
      <Dialog
        visible={dialog === 'contact'}
        icon="chatbubbles"
        title="Registrar contato"
        confirmLabel="Salvar"
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          if (!note.trim()) return toast('Descreva o contato', 'error');
          registerContact(c.id, channel === 'app' ? 'ligacao' : channel, note.trim());
          setNote('');
          setDialog(null);
          toast('Contato registrado');
        }}
      >
        <View style={styles.dialogBody}>
          <ChipGroup<LeadChannel>
            scroll={false}
            value={channel === 'app' ? 'ligacao' : channel}
            onChange={setChannel}
            options={[
              { value: 'ligacao', label: 'Ligação', icon: 'call-outline' },
              { value: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
            ]}
          />
          <Input placeholder="Ex.: cliente vai retornar na sexta" value={note} onChangeText={setNote} multiline maxLength={140} />
        </View>
      </Dialog>

    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', gap: spacing.sm },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  action: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  event: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  eventIcon: { width: 28, height: 28, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dialogBody: { alignSelf: 'stretch', gap: spacing.sm },
});
