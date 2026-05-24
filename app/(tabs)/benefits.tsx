import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

const rewards = [
  {
    title: "Diagnostico gratuito",
    points: 500,
    icon: "pulse"
  },
  {
    title: "10% em acessorios",
    points: 900,
    icon: "pricetag"
  },
  {
    title: "Lavagem cortesia",
    points: 1200,
    icon: "sparkles"
  }
] as const;

export default function BenefitsScreen() {
  const { vehicle, appointments } = useApp();
  const level = vehicle.loyaltyPoints >= 1500 ? "Blue Pro" : "Blue";

  return (
    <Screen>
      <SectionHeader
        title="Beneficios Ford"
        subtitle="Incentivos para manter as revisoes na rede oficial e fortalecer o relacionamento pos-venda."
      />

      <Card accent>
        <View style={styles.loyaltyTop}>
          <View>
            <Text style={styles.level}>{level}</Text>
            <Text style={styles.points}>{vehicle.loyaltyPoints} pontos</Text>
          </View>
          <Ionicons color={colors.ford} name="ribbon" size={36} />
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, (vehicle.loyaltyPoints / 1800) * 100)}%` }
            ]}
          />
        </View>
        <Text style={styles.body}>
          Agendamentos realizados pelo app somam pontos e ajudam a manter o cliente dentro da rede
          oficial Ford.
        </Text>
      </Card>

      <View style={styles.history}>
        <Card>
          <Text style={styles.stat}>{appointments.length}</Text>
          <Text style={styles.statLabel}>servicos agendados</Text>
        </Card>
        <Card>
          <Text style={styles.stat}>+180</Text>
          <Text style={styles.statLabel}>pontos por agendamento</Text>
        </Card>
      </View>

      {rewards.map((reward) => {
        const available = vehicle.loyaltyPoints >= reward.points;

        return (
          <Card key={reward.title}>
            <View style={styles.rewardRow}>
              <View style={styles.rewardIcon}>
                <Ionicons color={colors.ford} name={reward.icon} size={22} />
              </View>
              <View style={styles.rewardText}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardPoints}>{reward.points} pontos</Text>
              </View>
            </View>
            <PrimaryButton
              disabled={!available}
              label={available ? "Resgatar beneficio" : "Pontos insuficientes"}
              onPress={() => null}
              variant={available ? "primary" : "secondary"}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loyaltyTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  level: {
    color: colors.ford,
    fontSize: 15,
    fontWeight: "900"
  },
  points: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 2
  },
  progressTrack: {
    backgroundColor: "#DCEBF7",
    borderRadius: 999,
    height: 10,
    marginVertical: 14,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.ford,
    borderRadius: 999,
    height: 10
  },
  body: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  history: {
    flexDirection: "row",
    gap: 12
  },
  stat: {
    color: colors.ford,
    fontSize: 24,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  rewardRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  rewardIcon: {
    alignItems: "center",
    backgroundColor: "#EEF5FB",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  rewardText: {
    flex: 1
  },
  rewardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  rewardPoints: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  }
});
