import { ServiceItem, Vehicle } from "@/types";

export function getServiceProgress(vehicle: Vehicle) {
  const interval = vehicle.nextServiceKm - vehicle.lastServiceKm;
  const current = vehicle.mileage - vehicle.lastServiceKm;
  return Math.min(100, Math.max(0, Math.round((current / interval) * 100)));
}

export function getKmToNextService(vehicle: Vehicle) {
  return Math.max(0, vehicle.nextServiceKm - vehicle.mileage);
}

export function getServiceUrgency(vehicle: Vehicle) {
  const remaining = getKmToNextService(vehicle);

  if (remaining === 0) return "Revisao vencida";
  if (remaining <= 1000) return "Agendar em breve";
  return "Dentro do prazo";
}

export function sortServicesByNeed(vehicle: Vehicle, items: ServiceItem[]) {
  return [...items].sort((a, b) => {
    const aDistance = Math.abs(vehicle.mileage - a.recommendedKm);
    const bDistance = Math.abs(vehicle.mileage - b.recommendedKm);
    return aDistance - bDistance;
  });
}
