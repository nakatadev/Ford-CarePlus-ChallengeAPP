import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";
import { dealers, services } from "@/data/mockData";

export default function ScheduleScreen() {
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const defaultService = services.find((item) => item.id === params.serviceId) ?? services[0];
  const [serviceId, setServiceId] = useState(defaultService.id);
  const [dealerId, setDealerId] = useState(dealers[0].id);
  const [date, setDate] = useState("18/06/2026 09:30");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const { addAppointment } = useApp();

  const selectedService = useMemo(
    () => services.find((item) => item.id === serviceId) ?? services[0],
    [serviceId]
  );

  async function handleSubmit() {
    if (date.trim().length < 8) {
      setError("Informe uma data e horario para o atendimento.");
      return;
    }

    setError("");
    await addAppointment({
      id: `${Date.now()}`,
      serviceId,
      dealerId,
      date,
      notes
    });

    Alert.alert(
      "Agendamento registrado",
      "O atendimento foi salvo no aparelho e somou pontos no programa Ford Care+.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <SectionHeader
          title="Agendar servico"
          subtitle="Fluxo principal para levar o cliente ate a rede oficial."
        />
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.close}>
          <Text style={styles.closeText}>Fechar</Text>
        </Pressable>
      </View>

      <Card>
        <Text style={styles.label}>Servico</Text>
        <View style={styles.options}>
          {services.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => setServiceId(service.id)}
              style={[styles.option, serviceId === service.id && styles.optionActive]}
            >
              <Text
                style={[styles.optionText, serviceId === service.id && styles.optionTextActive]}
              >
                {service.title}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.description}>{selectedService.description}</Text>
      </Card>

      <Card>
        <Text style={styles.label}>Concessionaria</Text>
        <View style={styles.options}>
          {dealers.map((dealer) => (
            <Pressable
              key={dealer.id}
              onPress={() => setDealerId(dealer.id)}
              style={[styles.option, dealerId === dealer.id && styles.optionActive]}
            >
              <Text style={[styles.optionText, dealerId === dealer.id && styles.optionTextActive]}>
                {dealer.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Data e horario</Text>
        <TextInput onChangeText={setDate} placeholder="DD/MM/AAAA HH:mm" style={styles.input} value={date} />

        <Text style={[styles.label, styles.notesLabel]}>Observacoes</Text>
        <TextInput
          multiline
          onChangeText={setNotes}
          placeholder="Ex: verificar barulho ao frear"
          style={[styles.input, styles.textArea]}
          value={notes}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Card>

      <PrimaryButton icon="checkmark-circle" label="Confirmar agendamento" onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    gap: 12
  },
  close: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  closeText: {
    color: colors.ford,
    fontSize: 13,
    fontWeight: "800"
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10
  },
  options: {
    gap: 8
  },
  option: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  optionActive: {
    backgroundColor: "#EEF5FB",
    borderColor: "#9EC9EC"
  },
  optionText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  optionTextActive: {
    color: colors.ford
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12
  },
  input: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12
  },
  notesLabel: {
    marginTop: 16
  },
  textArea: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  error: {
    color: colors.red,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12
  }
});
