import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CustomerRow } from '@/components/CustomerRow';
import { Card, ChipGroup, EmptyState, ErrorState, Input, LoadingList, Screen, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { usePortfolio } from '@/store/hooks';
import { RiskTier } from '@/types';

type Filter = 'todos' | RiskTier;

export default function Clientes() {
  const { items, loading, error, reload, refresh, refreshing } = usePortfolio();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (items ?? []).filter(
      (c) =>
        (filter === 'todos' || c.risk.tier === filter) &&
        (!term || c.name.toLowerCase().includes(term) || c.vehicle.model.toLowerCase().includes(term) || c.vehicle.plate.toLowerCase().includes(term)),
    );
  }, [items, q, filter]);

  const count = (t: RiskTier) => items?.filter((c) => c.risk.tier === t).length ?? 0;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View>
        <Text variant="title">Clientes</Text>
        <Text variant="caption" color="textMuted">
          Ordenados pela probabilidade de sair da rede oficial
        </Text>
      </View>
      <Input testID="customer-search" icon="search" placeholder="Buscar por nome, modelo ou placa" value={q} onChangeText={setQ} autoCapitalize="none" />
      <ChipGroup<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'todos', label: `Todos (${items?.length ?? 0})` },
          { value: 'alto', label: `Alto (${count('alto')})` },
          { value: 'medio', label: `Médio (${count('medio')})` },
          { value: 'baixo', label: `Baixo (${count('baixo')})` },
        ]}
      />
      {loading ? (
        <LoadingList count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : list.length === 0 ? (
        <EmptyState icon="people-outline" title="Nenhum cliente encontrado" description="Ajuste a busca ou o filtro de risco." />
      ) : (
        <Card padded={false} style={{ overflow: 'hidden', marginBottom: spacing.lg }}>
          {list.map((c, i) => (
            <CustomerRow key={c.id} item={c} first={i === 0} />
          ))}
        </Card>
      )}
    </Screen>
  );
}
