import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { getKmToNextService, getServiceProgress, getServiceUrgency } from "@/utils/maintenance";

export default function HomeScreen() {
  const { vehicle, isReady, updateMileage, appointments } = useApp();
  const [mileageText, setMileageText] = useState(String(vehicle.mileage));
  const progress = getServiceProgress(vehicle);
  const remaining = getKmToNextService(vehicle);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.ford} />
      </View>
    );
  }

  async function handleMileageSave() {
    const parsed = Number(mileageText.replace(/\D/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      await updateMileage(parsed);
    }
  }

  return (
    <Screen>
      <View style={styles.hero}>
        <View>
          <Text style={styles.brand}>Ford Care+</Text>
          <Text style={styles.greeting}>Ola, {vehicle.ownerName}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons color="#FFFFFF" name="shield-checkmark" size={18} />
        </View>
      </View>

      <Card accent>
        <View style={styles.vehicleTop}>
          <View>
            <Text style={styles.model}>{vehicle.model}</Text>
            <Text style={styles.version}>{vehicle.version}</Text>
          </View>
          <Text style={styles.plate}>{vehicle.plate}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>VIN {vehicle.vin}</Text>
          <Text style={styles.meta}>{vehicle.mileage.toLocaleString("pt-BR")} km</Text>
        </View>
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Proxima revisao</Text>
          <Text style={[styles.status, remaining <= 1000 && styles.statusWarn]}>
            {getServiceUrgency(vehicle)}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.body}>
          Faltam {remaining.toLocaleString("pt-BR")} km para a revisao de{" "}
          {vehicle.nextServiceKm.toLocaleString("pt-BR")} km na rede oficial.
        </Text>
        <Link href="/schedule" asChild>
          <PrimaryButton icon="calendar" label="Agendar revisao" onPress={() => null} />
        </Link>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Atualizar quilometragem</Text>
        <Text style={styles.body}>
          A recomendacao muda conforme o uso do veiculo. Esse dado fica salvo no aparelho.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            keyboardType="numeric"
            onChangeText={setMileageText}
            placeholder="Quilometragem atual"
            style={styles.input}
            value={mileageText}
          />
          <PrimaryButton label="Salvar" onPress={handleMileageSave} style={styles.smallButton} />
        </View>
      </Card>

      <SectionHeader title="Resumo do relacionamento" />
      <View style={styles.stats}>
        <Card>
          <Text style={styles.statValue}>{vehicle.loyaltyPoints}</Text>
          <Text style={styles.statLabel}>pontos Ford</Text>
        </Card>
        <Card>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>agendamento(s)</Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center"
  },
  hero: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4
  },
  brand: {
    color: colors.ford,
    fontSize: 30,
    fontWeight: "900"
  },
  greeting: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 2
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.ford,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  vehicleTop: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  model: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "900"
  },
  version: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2
  },
  plate: {
    backgroundColor: colors.ink,
    borderRadius: 6,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  metaRow: {
    borderTopColor: "#D4E7F6",
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
    paddingTop: 12
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "800"
  },
  status: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "800"
  },
  statusWarn: {
    color: colors.amber
  },
  progressTrack: {
    backgroundColor: "#E8EDF2",
    borderRadius: 999,
    height: 10,
    marginVertical: 14,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.cyan,
    borderRadius: 999,
    height: 10
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14
  },
  inputRow: {
    flexDirection: "row",
    gap: 10
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12
  },
  smallButton: {
    minWidth: 96
  },
  stats: {
    flexDirection: "row",
    gap: 12
  },
  statValue: {
    color: colors.ford,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  }
});
