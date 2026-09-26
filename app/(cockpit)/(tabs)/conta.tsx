import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, KeyValue, Screen, SectionHeader, SwitchRow, Text } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { dealers } from '@/data/mockData';
import { MODEL } from '@/ml/churnModel';
import { useApp } from '@/store/AppContext';
import { useAuth } from '@/store/AuthContext';
import { initials } from '@/utils/format';

export default function Conta() {
  const { user, logout } = useAuth();
  const { demo, setDemo } = useApp();
  const [confirm, setConfirm] = useState(false);
  const dealer = dealers.find((d) => d.id === user?.dealerId) ?? dealers[0];

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text variant="title" color="textOnBrand">
            {initials(user?.name ?? '')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="title">{user?.name}</Text>
          <Text variant="caption" color="textMuted">
            Consultora de pós-venda · {dealer.name}
          </Text>
        </View>
      </View>

      <Card>
        <KeyValue icon="mail-outline" label="E-mail" value={user?.email ?? ''} />
        <KeyValue icon="shield-outline" label="Perfil de acesso" value="Concessionária" />
        <KeyValue icon="storefront-outline" label="Unidade" value={dealer.name} />
      </Card>

      <SectionHeader title="Modelo de risco" />
      <Card style={{ gap: spacing.xs }}>
        <KeyValue label="Algoritmo" value="Regressão logística" />
        <KeyValue label="Versão" value={`v${MODEL.version} (${MODEL.trainedAt})`} />
        <KeyValue label="Features" value={`${Object.keys(MODEL.features).length} variáveis`} />
        <KeyValue label="Faixas" value={`médio ≥ ${MODEL.thresholds.medio * 100}% · alto ≥ ${MODEL.thresholds.alto * 100}%`} />
        <Divider spaced />
        <Text variant="caption" color="textMuted">
          A inferência roda no próprio aparelho. Cada agendamento, oferta vista ou recusada gera um evento que alimenta o próximo treino.
        </Text>
      </Card>

      <SectionHeader title="Modo demonstração" />
      <Card>
        <SwitchRow icon="cloud-offline-outline" title="Simular falha de rede" description="Mostra os estados de erro do cockpit." value={demo.simulateNetworkError} onChange={(v) => setDemo({ simulateNetworkError: v })} />
      </Card>

      <Button label="Sair da conta" icon="log-out-outline" variant="secondary" onPress={() => setConfirm(true)} testID="logout" />
      <Text variant="caption" color="textMuted" align="center">
        Ford Conecta v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>

      <Dialog
        visible={confirm}
        icon="log-out-outline"
        title="Sair da conta?"
        confirmLabel="Sair"
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setConfirm(false);
          await logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
});
