import { ChurnFeatures, RiskResult, RiskTier } from '@/types';

/**
 * Modelo de risco de evasão (churn) do pós-venda — Regressão Logística embarcada.
 *
 * O treino acontece fora do app (notebook da disciplina de IA & ML). Aqui fica só a
 * inferência: média/desvio de cada feature (padronização z-score), pesos e intercepto.
 * Para atualizar o modelo, basta substituir MODEL pelos valores exportados do notebook
 * (ex.: `scaler.mean_`, `scaler.scale_`, `clf.coef_`, `clf.intercept_` do scikit-learn).
 *
 * Por ser linear, cada fator tem contribuição = peso × valor padronizado, o que permite
 * explicar ao consultor POR QUE o cliente está em risco (explicabilidade, exigência da LGPD
 * para decisões automatizadas — art. 20).
 */
export const MODEL = {
  version: '1.2.0',
  trainedAt: '2026-09',
  intercept: -0.3,
  features: {
    vehicleAgeYears: { mean: 3.4, std: 1.5, weight: 0.2 },
    monthsSinceLastService: { mean: 9.0, std: 4.5, weight: 0.43 },
    warrantyMonthsLeft: { mean: -2.0, std: 14.0, weight: -0.25 },
    networkVisits24m: { mean: 1.8, std: 1.2, weight: -0.32 },
    distanceKm: { mean: 13.0, std: 7.5, weight: 0.18 },
    lastNps: { mean: 7.2, std: 1.7, weight: -0.23 },
    kmPerYear: { mean: 18.0, std: 7.0, weight: 0.09 },
    appEngaged: { mean: 0.3, std: 0.46, weight: -0.16 },
    hasUpcomingAppointment: { mean: 0.12, std: 0.32, weight: -0.35 },
    offerResponseRate: { mean: 0.3, std: 0.2, weight: -0.18 },
  } satisfies Record<keyof ChurnFeatures, { mean: number; std: number; weight: number }>,
  thresholds: { medio: 0.35, alto: 0.6 },
};

const LABELS: Record<keyof ChurnFeatures, string> = {
  vehicleAgeYears: 'Idade do veículo',
  monthsSinceLastService: 'Tempo desde a última revisão',
  warrantyMonthsLeft: 'Situação da garantia',
  networkVisits24m: 'Visitas à rede (24 meses)',
  distanceKm: 'Distância da concessionária',
  lastNps: 'Satisfação (último NPS)',
  kmPerYear: 'Rodagem anual',
  appEngaged: 'Engajamento com o app',
  hasUpcomingAppointment: 'Agendamento ativo',
  offerResponseRate: 'Resposta a ofertas',
};

function describe(feature: keyof ChurnFeatures, value: number): string {
  switch (feature) {
    case 'vehicleAgeYears':
      return `${value} ano(s) de uso`;
    case 'monthsSinceLastService':
      return `${Math.round(value)} mese(s) sem passar na rede`;
    case 'warrantyMonthsLeft':
      return value >= 0 ? `Garantia termina em ${Math.round(value)} mese(s)` : `Fora da garantia há ${Math.abs(Math.round(value))} mese(s)`;
    case 'networkVisits24m':
      return `${value} visita(s) na rede oficial`;
    case 'distanceKm':
      return `${value.toFixed(1)} km da concessionária`;
    case 'lastNps':
      return `Nota ${value}/10 na última pesquisa`;
    case 'kmPerYear':
      return `${Math.round(value)} mil km por ano`;
    case 'appEngaged':
      return value ? 'Usa o app e aceita ofertas' : 'Não usa o app';
    case 'hasUpcomingAppointment':
      return value ? 'Já tem serviço agendado' : 'Nenhum serviço agendado';
    case 'offerResponseRate':
      return `Responde a ${Math.round(value * 100)}% das ofertas`;
  }
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function tierOf(p: number): RiskTier {
  if (p >= MODEL.thresholds.alto) return 'alto';
  if (p >= MODEL.thresholds.medio) return 'medio';
  return 'baixo';
}

export const tierLabel: Record<RiskTier, string> = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' };

export function recommendedAction(tier: RiskTier, f: ChurnFeatures): string {
  if (f.hasUpcomingAppointment) return 'Confirmar presença 24h antes e oferecer leva-e-traz.';
  if (tier === 'alto') {
    if (f.warrantyMonthsLeft < 0) return 'Ligar hoje: oferta de revisão com 20% + diagnóstico gratuito.';
    return 'Contato ativo por WhatsApp com oferta de revisão com 15%.';
  }
  if (tier === 'medio') {
    if (f.warrantyMonthsLeft >= 0 && f.warrantyMonthsLeft <= 3) return 'Enviar oferta de revisão de fim de garantia pelo app.';
    return 'Enviar lembrete de revisão pelo app com 10% de desconto.';
  }
  return 'Manter relacionamento: lembrete automático de revisão.';
}

/** Inferência + explicação dos fatores. */
export function predictChurn(f: ChurnFeatures): RiskResult {
  let z = MODEL.intercept;
  const factors = (Object.keys(MODEL.features) as (keyof ChurnFeatures)[]).map((key) => {
    const { mean, std, weight } = MODEL.features[key];
    const contribution = weight * ((f[key] - mean) / std);
    z += contribution;
    return { feature: key, label: LABELS[key], contribution, detail: describe(key, f[key]) };
  });
  const probability = sigmoid(z);
  const tier = tierOf(probability);
  factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  return { probability, tier, factors, recommendedAction: recommendedAction(tier, f) };
}
