#!/usr/bin/env node
/**
 * Ford Conecta — simulador de veículo conectado (MQTT)
 *
 * Publica telemetria no mesmo formato do firmware ESP32 (iot/esp32) no tópico
 *   fordconecta/<VIN>/telemetry
 *
 * Uso:
 *   cd iot/simulator && npm install
 *   node publisher.js                               # broker público HiveMQ (TLS)
 *   BROKER=mqtt://localhost:1883 node publisher.js  # broker local (ex.: Mosquitto)
 *   VIN=8AFBR23L1RJ000024 INTERVAL=2000 node publisher.js
 *
 * No app: Veículo › Fonte dos dados › MQTT (IoT) › Conectar.
 */
const mqtt = require('mqtt');

const BROKER = process.env.BROKER || 'mqtts://broker.hivemq.com:8883';
const VIN = process.env.VIN || '8AFBR23L1RJ000024';
const INTERVAL = Number(process.env.INTERVAL || 2000);
const TOPIC = `fordconecta/${VIN}/telemetry`;

const LAST_SERVICE_KM = 30000;
const state = {
  odometerKm: Number(process.env.ODOMETER || 38200),
  fuelPct: 64,
  engineTempC: 88,
  tirePsi: [35, 34.6, 31.2, 35.2],
  dtc: [],
  tick: 0,
};

const jitter = (a) => (Math.random() - 0.5) * 2 * a;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function nextReading() {
  state.tick++;
  const driving = Math.floor(state.tick / 20) % 3 !== 2;
  if (driving) state.odometerKm += 0.08 + Math.random() * 0.1;
  state.fuelPct = clamp(state.fuelPct - (driving ? 0.03 : 0), 5, 100);
  state.engineTempC = driving ? clamp(state.engineTempC + jitter(1.2), 84, 97) : clamp(state.engineTempC - 0.8, 40, 97);
  state.tirePsi[2] = clamp(state.tirePsi[2] - 0.06, 26, 36);
  return {
    vin: VIN,
    ts: Date.now(),
    odometerKm: +state.odometerKm.toFixed(1),
    oilLifePct: +clamp(100 * (1 - (state.odometerKm - LAST_SERVICE_KM) / 10000), 0, 100).toFixed(1),
    batteryV: +(driving ? 14.1 + jitter(0.15) : 12.45 + jitter(0.06)).toFixed(2),
    fuelPct: +state.fuelPct.toFixed(1),
    engineTempC: +state.engineTempC.toFixed(1),
    tirePsi: state.tirePsi.map((p, i) => +(i === 2 ? p : p + jitter(0.2)).toFixed(1)),
    dtc: state.dtc,
    ignitionOn: driving,
  };
}

const client = mqtt.connect(BROKER, { clientId: `fordconecta-sim-${Math.random().toString(16).slice(2, 8)}`, reconnectPeriod: 2000 });

client.on('connect', () => {
  console.log(`✔ conectado em ${BROKER}\n  publicando em ${TOPIC} a cada ${INTERVAL} ms`);
  console.log('  teclas: [f] injeta falha P0301 · [c] limpa falhas · [q] sai');
  setInterval(() => {
    const payload = nextReading();
    client.publish(TOPIC, JSON.stringify(payload), { qos: 0 });
    process.stdout.write(`\r  odo ${payload.odometerKm} km · óleo ${payload.oilLifePct}% · bat ${payload.batteryV} V · pneu TE ${payload.tirePsi[2]} psi · dtc [${payload.dtc}]   `);
  }, INTERVAL);
});
client.on('error', (e) => console.error('\n✖ erro MQTT:', e.message));

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', (k) => {
    const key = k.toString();
    if (key === 'f') state.dtc = ['P0301'];
    if (key === 'c') state.dtc = [];
    if (key === 'q' || key === '\u0003') process.exit(0);
  });
}
