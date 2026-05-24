import { Dealer, ServiceItem, Vehicle } from "@/types";

export const initialVehicle: Vehicle = {
  ownerName: "Cliente Ford",
  model: "Ranger",
  version: "Limited 3.0 V6",
  plate: "FIA3P24",
  vin: "8AFBR23L1RJ000024",
  mileage: 38200,
  lastServiceKm: 30000,
  nextServiceKm: 40000,
  loyaltyPoints: 1280
};

export const services: ServiceItem[] = [
  {
    id: "oil-filter",
    title: "Troca de oleo e filtros",
    description: "Servico essencial para manter desempenho, consumo e durabilidade do motor.",
    recommendedKm: 40000,
    priceRange: "R$ 520 - R$ 780",
    officialNetworkBenefit: "Pecas originais, registro no historico Ford e garantia do servico."
  },
  {
    id: "brakes",
    title: "Inspecao de freios",
    description: "Checagem de pastilhas, discos, fluido e sensores de seguranca.",
    recommendedKm: 40000,
    priceRange: "R$ 180 - R$ 450",
    officialNetworkBenefit: "Checklist padronizado e alerta preventivo para desgaste."
  },
  {
    id: "tires",
    title: "Rodizio e alinhamento",
    description: "Ajuste para estabilidade, conforto e melhor aproveitamento dos pneus.",
    recommendedKm: 45000,
    priceRange: "R$ 220 - R$ 360",
    officialNetworkBenefit: "Tecnicos treinados para calibragem e geometria correta do modelo."
  },
  {
    id: "battery",
    title: "Diagnostico de bateria",
    description: "Teste de carga e analise preventiva do sistema eletrico.",
    recommendedKm: 42000,
    priceRange: "Sem custo na rede parceira",
    officialNetworkBenefit: "Laudo rapido e desconto em substituicao quando necessario."
  }
];

export const dealers: Dealer[] = [
  {
    id: "ford-santo-amaro",
    name: "Ford Santo Amaro",
    city: "Sao Paulo",
    state: "SP",
    cep: "04705-000",
    phone: "(11) 4002-1020",
    distanceKm: 4.8,
    rating: 4.8
  },
  {
    id: "ford-pinheiros",
    name: "Ford Pinheiros",
    city: "Sao Paulo",
    state: "SP",
    cep: "05422-000",
    phone: "(11) 4002-2030",
    distanceKm: 8.3,
    rating: 4.7
  },
  {
    id: "ford-abc",
    name: "Ford ABC Motors",
    city: "Sao Bernardo do Campo",
    state: "SP",
    cep: "09750-650",
    phone: "(11) 4002-3040",
    distanceKm: 18.6,
    rating: 4.6
  }
];
