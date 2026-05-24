import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors } from "@/constants/theme";
import { dealers } from "@/data/mockData";
import { fetchAddressByCep } from "@/services/cep";
import { CepAddress } from "@/types";

export default function DealersScreen() {
  const [cep, setCep] = useState("01310-100");
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAddressByCep(cep);
      setAddress(result);
    } catch (err) {
      setAddress(null);
      setError(err instanceof Error ? err.message : "Erro inesperado ao buscar CEP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <SectionHeader
        title="Rede oficial"
        subtitle="Consulte o CEP pela API ViaCEP e veja unidades sugeridas para manter o historico Ford."
      />

      <Card>
        <Text style={styles.label}>CEP de referencia</Text>
        <View style={styles.searchRow}>
          <TextInput
            keyboardType="numeric"
            onChangeText={setCep}
            placeholder="00000-000"
            style={styles.input}
            value={cep}
          />
          <PrimaryButton
            disabled={loading}
            icon="search"
            label={loading ? "Buscando" : "Buscar"}
            onPress={handleSearch}
            style={styles.searchButton}
          />
        </View>
        {loading ? <ActivityIndicator color={colors.ford} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {address ? (
          <View style={styles.addressBox}>
            <Ionicons color={colors.ford} name="map" size={18} />
            <Text style={styles.addressText}>
              {address.logradouro || "Endereco sem logradouro"}, {address.bairro} -{" "}
              {address.localidade}/{address.uf}
            </Text>
          </View>
        ) : null}
      </Card>

      {dealers.map((dealer) => (
        <Card key={dealer.id}>
          <View style={styles.dealerTop}>
            <View style={styles.dealerTitle}>
              <Text style={styles.name}>{dealer.name}</Text>
              <Text style={styles.place}>
                {dealer.city} / {dealer.state}
              </Text>
            </View>
            <View style={styles.rating}>
              <Ionicons color={colors.amber} name="star" size={14} />
              <Text style={styles.ratingText}>{dealer.rating}</Text>
            </View>
          </View>
          <View style={styles.dealerMeta}>
            <Text style={styles.meta}>{dealer.distanceKm.toFixed(1)} km</Text>
            <Text style={styles.meta}>CEP {dealer.cep}</Text>
            <Text style={styles.meta}>{dealer.phone}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 10
  },
  searchRow: {
    flexDirection: "row",
    gap: 10
  },
  input: {
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12
  },
  searchButton: {
    minWidth: 118
  },
  loader: {
    marginTop: 14
  },
  error: {
    color: colors.red,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12
  },
  addressBox: {
    alignItems: "flex-start",
    backgroundColor: "#F2F8FD",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 12
  },
  addressText: {
    color: colors.ink,
    flex: 1,
    fontSize: 13,
    lineHeight: 19
  },
  dealerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  dealerTitle: {
    flex: 1
  },
  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  place: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3
  },
  rating: {
    alignItems: "center",
    backgroundColor: "#FFF6E8",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  ratingText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900"
  },
  dealerMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14
  },
  meta: {
    backgroundColor: "#F5F7FA",
    borderRadius: 999,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6
  }
});
