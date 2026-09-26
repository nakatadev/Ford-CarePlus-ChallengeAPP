#!/usr/bin/env node
/**
 * Broker MQTT local para testes sem internet:
 *   - TCP        mqtt://localhost:1883   (simulador / ESP32)
 *   - WebSocket  ws://<IP-do-PC>:8888    (app Ford Conecta)
 *
 * Uso: cd iot/simulator && npm install && npm run broker
 * No celular, use o IP do computador na mesma rede Wi-Fi (ex.: ws://192.168.0.10:8888).
 */
const aedes = require('aedes')();
const net = require('net');
const http = require('http');
const ws = require('websocket-stream');

const TCP_PORT = Number(process.env.TCP_PORT || 1883);
const WS_PORT = Number(process.env.WS_PORT || 8888);

net.createServer(aedes.handle).listen(TCP_PORT, () => console.log(`✔ MQTT TCP em mqtt://0.0.0.0:${TCP_PORT}`));
const httpServer = http.createServer();
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(WS_PORT, () => console.log(`✔ MQTT WebSocket em ws://0.0.0.0:${WS_PORT}`));

aedes.on('client', (c) => console.log(`+ cliente ${c.id}`));
aedes.on('clientDisconnect', (c) => console.log(`- cliente ${c.id}`));
aedes.on('subscribe', (subs, c) => console.log(`  ${c?.id} assinou ${subs.map((s) => s.topic).join(', ')}`));
