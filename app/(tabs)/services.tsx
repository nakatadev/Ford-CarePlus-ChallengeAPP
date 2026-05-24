import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { services } from "@/data/mockData";
import { sortServicesByNeed } from "@/utils/maintenance";

export default function ServicesScreen() {
  const { vehicle, appointments } = useApp();
  const orderedServices = sortServicesByNeed(vehicle, services);

  return (
    <Screen>
      <SectionHeader
        title="Revisoes e cuidados"
        subtitle="Recomendacoes priorizadas pela quilometragem atual do veiculo."
      />

      {orderedServices.map((service) => {
        const isScheduled = appointments.some((item) => item.serviceId === service.id);

        return (
          <Card key={service.id} accent={isScheduled}>
            <View style={styles.top}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>{service.title}</Text>
                <Text style={styles.km}>
                  recomendado em {service.recommendedKm.toLocaleString("pt-BR")} km
                </Text>
              </View>
              {isScheduled ? <Text style={styles.tag}>agendado</Text> : null}
            </View>
            <Text style={styles.description}>{service.description}</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Faixa estimada</Text>
              <Text style={styles.infoValue}>{service.priceRange}</Text>
            </View>
            <Text style={styles.benefit}>{service.officialNetworkBenefit}</Text>
            <Link href={{ pathname: "/schedule", params: { serviceId: service.id } }} asChild>
              <PrimaryButton
                icon="calendar"
                label={isScheduled ? "Agendar outro horario" : "Agendar na rede Ford"}
                onPress={() => null}
                variant={isScheduled ? "secondary" : "primary"}
              />
            </Link>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  titleWrap: {
    flex: 1,
    gap: 4
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  km: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  tag: {
    backgroundColor: "#E6F4EE",
    borderRadius: 999,
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12
  },
  infoBox: {
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    gap: 2,
    marginTop: 14,
    padding: 12
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  infoValue: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  benefit: {
    color: colors.ford,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginVertical: 14
  }
});
