export type Vehicle = {
  ownerName: string;
  model: string;
  version: string;
  plate: string;
  vin: string;
  mileage: number;
  lastServiceKm: number;
  nextServiceKm: number;
  loyaltyPoints: number;
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  recommendedKm: number;
  priceRange: string;
  officialNetworkBenefit: string;
};

export type Appointment = {
  id: string;
  serviceId: string;
  dealerId: string;
  date: string;
  notes: string;
};

export type Dealer = {
  id: string;
  name: string;
  city: string;
  state: string;
  cep: string;
  phone: string;
  distanceKm: number;
  rating: number;
};

export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};
