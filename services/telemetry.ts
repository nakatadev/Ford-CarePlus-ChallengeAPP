import { Telemetry, TelemetryStatus } from '@/types';

/**
 * Fontes de telemetria do veículo conectado (camada IoT).
 *
 *  - SimulatedSource: gera leituras realistas no próprio app (padrão; funciona offline).
 *  - MqttSource: assina o tópico `fordconecta/<VIN>/telemetry` em um broker MQTT via
 *    WebSocket seguro (wss). O firmware ESP32 em /iot/esp32 e o simulador Node em
 *    /iot/simulator publicam exatamente este formato de payload.
 */

export type TelemetryListener = (t: Telemetry) => void;
export type StatusListener = (s: TelemetryStatus, detail?: string) => void;

export interface TelemetrySource {
  start(onData: TelemetryListener, onStatus: StatusListener): void;
  stop(): void;
}

export const telemetryTopic = (vin: string) => `fordconecta/${vin}/telemetry`;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const jitter = (amp: number) => (Math.random() - 0.5) * 2 * amp;

/* ============================ Simulador ============================ */

export class SimulatedSource implements TelemetrySource {
  private timer: ReturnType<typeof setInterval> | null = null;
  private state: Telemetry;
  private tick = 0;

  constructor(
    odometerKm: number,
    private lastServiceKm: number,
    private intervalMs = 2000,
  ) {
    this.state = {
      timestamp: Date.now(),
      odometerKm,
      oilLifePct: this.oilLife(odometerKm),
      batteryV: 12.55,
      fuelPct: 64,
      engineTempC: 88,
      tirePsi: [35, 34.6, 31.2, 35.2],
      dtc: [],
      ignitionOn: true,
    };
  }

  private oilLife(odo: number) {
    // intervalo de troca: 10.000 km
    return clamp(100 * (1 - (odo - this.lastServiceKm) / 10000), 0, 100);
  }

  /** Injeta uma falha para demonstração (ex.: misfire no cilindro 1). */
  injectFault(code = 'P0301') {
    if (!this.state.dtc.includes(code)) this.state.dtc = [...this.state.dtc, code];
  }

  clearFaults() {
    this.state.dtc = [];
  }

  /** Sincroniza o hodômetro quando o usuário corrige a quilometragem manualmente. */
  setOdometer(km: number) {
    this.state.odometerKm = km;
    this.state.oilLifePct = this.oilLife(km);
  }

  start(onData: TelemetryListener, onStatus: StatusListener) {
    onStatus('conectando');
    setTimeout(() => {
      onStatus('online');
      onData({ ...this.state, timestamp: Date.now() });
    }, 700);
    this.timer = setInterval(() => {
      this.tick++;
      const s = this.state;
      // alterna entre dirigindo e estacionado a cada ~40s
      const driving = Math.floor(this.tick / 20) % 3 !== 2;
      const odo = s.odometerKm + (driving ? 0.08 + Math.random() * 0.1 : 0);
      this.state = {
        timestamp: Date.now(),
        ignitionOn: driving,
        odometerKm: odo,
        oilLifePct: this.oilLife(odo),
        batteryV: +(driving ? 14.1 + jitter(0.15) : 12.45 + jitter(0.06)).toFixed(2),
        fuelPct: clamp(s.fuelPct - (driving ? 0.03 : 0), 5, 100),
        engineTempC: driving ? clamp(s.engineTempC + jitter(1.2), 84, 97) : clamp(s.engineTempC - 0.8, 40, 97),
        // pneu traseiro esquerdo com vazamento lento → gera alerta durante a demo
        tirePsi: [
          +(35 + jitter(0.2)).toFixed(1),
          +(34.6 + jitter(0.2)).toFixed(1),
          +clamp(s.tirePsi[2] - 0.06, 26, 36).toFixed(1),
          +(35.2 + jitter(0.2)).toFixed(1),
        ] as Telemetry['tirePsi'],
        dtc: s.dtc,
      };
      onData(this.state);
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

/* ============================ MQTT (WebSocket) ============================ */

type PahoModule = {
  Client: new (uri: string, clientId: string) => PahoClient;
};
type PahoClient = {
  onConnectionLost: (resp: { errorCode: number; errorMessage: string }) => void;
  onMessageArrived: (msg: { payloadString: string; destinationName: string }) => void;
  connect(opts: {
    onSuccess: () => void;
    onFailure: (e: { errorMessage: string }) => void;
    useSSL?: boolean;
    timeout?: number;
    reconnect?: boolean;
    keepAliveInterval?: number;
  }): void;
  subscribe(topic: string, opts?: { qos?: number }): void;
  disconnect(): void;
  isConnected(): boolean;
};

/** Valida e normaliza o payload recebido (nunca confiar no dispositivo). */
export function parseTelemetryPayload(raw: string, previous: Telemetry | null): Telemetry | null {
  try {
    const d = JSON.parse(raw);
    const num = (v: unknown, min: number, max: number, fb: number) =>
      typeof v === 'number' && Number.isFinite(v) ? clamp(v, min, max) : fb;
    const p = previous;
    const tires = Array.isArray(d.tirePsi) && d.tirePsi.length === 4 ? d.tirePsi : p?.tirePsi ?? [35, 35, 35, 35];
    return {
      timestamp: Date.now(),
      odometerKm: num(d.odometerKm, 0, 2_000_000, p?.odometerKm ?? 0),
      oilLifePct: num(d.oilLifePct, 0, 100, p?.oilLifePct ?? 100),
      batteryV: num(d.batteryV, 0, 18, p?.batteryV ?? 12.6),
      fuelPct: num(d.fuelPct, 0, 100, p?.fuelPct ?? 50),
      engineTempC: num(d.engineTempC, -40, 150, p?.engineTempC ?? 90),
      tirePsi: tires.map((t: unknown) => num(t, 0, 80, 35)) as Telemetry['tirePsi'],
      dtc: Array.isArray(d.dtc) ? d.dtc.filter((c: unknown) => typeof c === 'string' && /^[PBCU][0-9A-F]{4}$/i.test(c)).slice(0, 10) : [],
      ignitionOn: typeof d.ignitionOn === 'boolean' ? d.ignitionOn : true,
    };
  } catch {
    return null;
  }
}

export class MqttSource implements TelemetrySource {
  private client: PahoClient | null = null;
  private last: Telemetry | null = null;
  private stopped = false;

  constructor(
    private brokerUrl: string,
    private vin: string,
  ) {}

  start(onData: TelemetryListener, onStatus: StatusListener) {
    this.stopped = false;
    onStatus('conectando');
    let Paho: PahoModule;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Paho = require('paho-mqtt') as PahoModule;
    } catch {
      onStatus('erro', 'Biblioteca MQTT indisponível');
      return;
    }
    try {
      const clientId = `fordconecta-app-${Math.random().toString(16).slice(2, 10)}`;
      // Paho exige caminho na URI (ex.: wss://host:8884/mqtt); completa se o usuário omitir
      const uri = /^wss?:\/\/[^/]+$/.test(this.brokerUrl) ? `${this.brokerUrl}/mqtt` : this.brokerUrl;
      const client = new Paho.Client(uri, clientId);
      this.client = client;
      client.onConnectionLost = (resp) => {
        if (!this.stopped && resp.errorCode !== 0) onStatus('offline', resp.errorMessage);
      };
      client.onMessageArrived = (msg) => {
        const t = parseTelemetryPayload(msg.payloadString, this.last);
        if (t) {
          this.last = t;
          onData(t);
        }
      };
      client.connect({
        useSSL: this.brokerUrl.startsWith('wss'),
        timeout: 8,
        keepAliveInterval: 30,
        reconnect: true,
        onSuccess: () => {
          if (this.stopped) return;
          client.subscribe(telemetryTopic(this.vin), { qos: 0 });
          onStatus('online', 'Aguardando dados do veículo…');
        },
        onFailure: (e) => onStatus('erro', e.errorMessage || 'Falha ao conectar no broker'),
      });
    } catch (e) {
      onStatus('erro', e instanceof Error ? e.message : 'URL do broker inválida');
    }
  }

  stop() {
    this.stopped = true;
    try {
      if (this.client?.isConnected()) this.client.disconnect();
    } catch {
      // ignore
    }
    this.client = null;
  }
}

export const DEFAULT_MQTT_URL = 'wss://broker.hivemq.com:8884/mqtt';
