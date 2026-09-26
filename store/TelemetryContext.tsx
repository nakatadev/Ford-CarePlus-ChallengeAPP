import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MqttSource, SimulatedSource, TelemetrySource } from '@/services/telemetry';
import { storage } from '@/services/storage';
import { Telemetry, TelemetryAlert, TelemetryStatus } from '@/types';
import { evaluateTelemetry } from '@/utils/maintenance';
import { useApp } from './AppContext';

type TelemetryContextValue = {
  telemetry: Telemetry | null;
  status: TelemetryStatus;
  statusDetail?: string;
  alerts: TelemetryAlert[];
  history: { batteryV: number[]; engineTempC: number[] };
  enabled: boolean;
  injectFault: () => void;
  clearFaults: () => void;
  reconnect: () => void;
};

const TelemetryContext = createContext<TelemetryContextValue | null>(null);
const HISTORY = 30;

/**
 * Mantém a conexão com o veículo (simulador ou MQTT), transforma leituras em
 * alertas e dispara notificações quando surge um alerta novo.
 * Respeita o consentimento LGPD: sem consentimento de telemetria, nada é coletado.
 */
export function TelemetryProvider({ children }: { children: ReactNode }) {
  const { vehicle, demo, consent, isReady, updateMileage, addNotification } = useApp();
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [status, setStatus] = useState<TelemetryStatus>('offline');
  const [statusDetail, setDetail] = useState<string>();
  const [history, setHistory] = useState<{ batteryV: number[]; engineTempC: number[] }>({ batteryV: [], engineTempC: [] });
  const [session, setSession] = useState(0);
  const sourceRef = useRef<TelemetrySource | null>(null);
  const notified = useRef<Set<string>>(new Set());
  const mileageRef = useRef(vehicle.mileage);
  const enabled = consent.telemetry;

  useEffect(() => {
    storage.get<string[]>('notifiedAlerts', []).then((ids) => (notified.current = new Set(ids)));
  }, []);

  // (re)inicia a fonte quando mudam: fonte, URL, consentimento
  useEffect(() => {
    if (!isReady) return;
    if (!enabled) {
      setStatus('offline');
      setDetail('Coleta desativada nas preferências de privacidade');
      setTelemetry(null);
      return;
    }
    const src: TelemetrySource =
      demo.telemetrySource === 'mqtt'
        ? new MqttSource(demo.mqttUrl, vehicle.vin)
        : new SimulatedSource(mileageRef.current, vehicle.lastServiceKm);
    sourceRef.current = src;
    setTelemetry(null);
    setHistory({ batteryV: [], engineTempC: [] });
    src.start(
      (t) => {
        setTelemetry(t);
        setHistory((h) => ({
          batteryV: [...h.batteryV, t.batteryV].slice(-HISTORY),
          engineTempC: [...h.engineTempC, t.engineTempC].slice(-HISTORY),
        }));
      },
      (s, d) => {
        setStatus(s);
        setDetail(d);
      },
    );
    return () => src.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, enabled, demo.telemetrySource, demo.mqttUrl, vehicle.vin, session]);

  // hodômetro do veículo → quilometragem do app (a cada km rodado)
  useEffect(() => {
    if (telemetry && telemetry.odometerKm >= mileageRef.current + 1) {
      mileageRef.current = Math.floor(telemetry.odometerKm);
      updateMileage(mileageRef.current);
    }
  }, [telemetry, updateMileage]);

  // correção manual da quilometragem → sincroniza simulador
  useEffect(() => {
    if (Math.abs(vehicle.mileage - mileageRef.current) >= 1) {
      mileageRef.current = vehicle.mileage;
      if (sourceRef.current instanceof SimulatedSource) sourceRef.current.setOdometer(vehicle.mileage);
    }
  }, [vehicle.mileage]);

  const alerts = useMemo(() => evaluateTelemetry(telemetry), [telemetry]);

  // alerta novo → central de notificações + push
  useEffect(() => {
    const fresh = alerts.filter((a) => !notified.current.has(`${a.id}:${a.severity}`));
    if (!fresh.length) return;
    fresh.forEach((a) => {
      notified.current.add(`${a.id}:${a.severity}`);
      addNotification({
        title: a.severity === 'critico' ? `⚠️ ${a.title}` : a.title,
        body: `${a.description} Toque para ver as ofertas.`,
        type: 'alerta',
        route: '/veiculo',
      });
    });
    storage.set('notifiedAlerts', [...notified.current]);
  }, [alerts, addNotification]);

  const injectFault = useCallback(() => {
    if (sourceRef.current instanceof SimulatedSource) sourceRef.current.injectFault('P0301');
  }, []);
  const clearFaults = useCallback(() => {
    if (sourceRef.current instanceof SimulatedSource) sourceRef.current.clearFaults();
    notified.current.forEach((k) => k.startsWith('dtc') && notified.current.delete(k));
  }, []);
  const reconnect = useCallback(() => setSession((s) => s + 1), []);

  const value = useMemo(
    () => ({ telemetry, status, statusDetail, alerts, history, enabled, injectFault, clearFaults, reconnect }),
    [telemetry, status, statusDetail, alerts, history, enabled, injectFault, clearFaults, reconnect],
  );
  return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error('useTelemetry deve ser usado dentro de <TelemetryProvider>');
  return ctx;
}
