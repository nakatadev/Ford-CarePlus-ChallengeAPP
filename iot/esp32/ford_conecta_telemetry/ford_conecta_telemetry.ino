/*
 * Ford Conecta — firmware de telemetria veicular (ESP32)
 * ------------------------------------------------------
 * Lê sensores do veículo (protótipo com potenciômetros/botão, compatível com o
 * simulador Wokwi) e publica JSON via MQTT sobre TLS no tópico:
 *
 *     fordconecta/<VIN>/telemetry
 *
 * O app Ford Conecta assina esse tópico (Veículo › Fonte dos dados › MQTT).
 *
 * Bibliotecas (Arduino IDE › Gerenciador de Bibliotecas):
 *   - PubSubClient (Nick O'Leary)
 *   - ArduinoJson  (Benoit Blanchon) v7
 *
 * Ligações do protótipo:
 *   GPIO34  potenciômetro → nível de combustível (0–100 %)
 *   GPIO35  divisor resistivo da bateria (12 V → 0–3,3 V, razão 1:5,7)
 *   GPIO32  potenciômetro → temperatura do motor (40–120 °C)
 *   GPIO33  potenciômetro → pressão do pneu traseiro esquerdo (20–40 PSI)
 *   GPIO25  chave → ignição ligada/desligada
 *   GPIO0   botão (BOOT) → injeta código de falha P0301 (demonstração)
 */
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// ---------- Configuração (em produção: provisionar via BLE/NVS, nunca no código) ----------
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";
const char* MQTT_HOST = "broker.hivemq.com";
const uint16_t MQTT_PORT = 8883;               // MQTT sobre TLS
const char* VIN = "8AFBR23L1RJ000024";
const uint32_t PUBLISH_MS = 2000;

const float LAST_SERVICE_KM = 30000.0;
const float OIL_INTERVAL_KM = 10000.0;

// ---------- Pinos ----------
const int PIN_FUEL = 34, PIN_BATT = 35, PIN_TEMP = 32, PIN_TIRE = 33, PIN_IGN = 25, PIN_FAULT = 0;

WiFiClientSecure net;
PubSubClient mqtt(net);
char topic[64];
float odometerKm = 38200.0;
bool faultActive = false;
uint32_t lastPublish = 0;

float readPct(int pin) { return analogRead(pin) * 100.0 / 4095.0; }
float mapf(float x, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (x - inMin) * (outMax - outMin) / (inMax - inMin);
}

void connectWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.printf(" ok (%s)\n", WiFi.localIP().toString().c_str());
}

void connectMqtt() {
  while (!mqtt.connected()) {
    String clientId = "fordconecta-esp32-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    Serial.printf("MQTT %s:%u ... ", MQTT_HOST, MQTT_PORT);
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("conectado");
    } else {
      Serial.printf("falhou (rc=%d), nova tentativa em 2 s\n", mqtt.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_IGN, INPUT_PULLUP);
  pinMode(PIN_FAULT, INPUT_PULLUP);
  analogReadResolution(12);
  snprintf(topic, sizeof(topic), "fordconecta/%s/telemetry", VIN);

  connectWifi();
  // TLS: em produção fixe o certificado raiz do broker com net.setCACert(ROOT_CA).
  // setInsecure() mantém a criptografia do canal, mas sem validar o servidor (apenas protótipo).
  net.setInsecure();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setBufferSize(512);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWifi();
  if (!mqtt.connected()) connectMqtt();
  mqtt.loop();

  if (digitalRead(PIN_FAULT) == LOW) { faultActive = !faultActive; delay(250); }

  if (millis() - lastPublish < PUBLISH_MS) return;
  lastPublish = millis();

  bool ignitionOn = digitalRead(PIN_IGN) == LOW;
  if (ignitionOn) odometerKm += 0.1;  // ~180 km/h de simulação acelerada

  float batteryV = analogRead(PIN_BATT) * 3.3 / 4095.0 * 5.7;
  float oilLife = constrain(100.0 * (1.0 - (odometerKm - LAST_SERVICE_KM) / OIL_INTERVAL_KM), 0.0, 100.0);

  JsonDocument doc;
  doc["vin"] = VIN;
  doc["odometerKm"] = odometerKm;
  doc["oilLifePct"] = oilLife;
  doc["batteryV"] = batteryV;
  doc["fuelPct"] = readPct(PIN_FUEL);
  doc["engineTempC"] = mapf(readPct(PIN_TEMP), 0, 100, 40, 120);
  JsonArray tires = doc["tirePsi"].to<JsonArray>();
  tires.add(35.0); tires.add(35.0);
  tires.add(mapf(readPct(PIN_TIRE), 0, 100, 20, 40));
  tires.add(35.0);
  JsonArray dtc = doc["dtc"].to<JsonArray>();
  if (faultActive) dtc.add("P0301");
  doc["ignitionOn"] = ignitionOn;

  char payload[384];
  size_t n = serializeJson(doc, payload, sizeof(payload));
  bool ok = mqtt.publish(topic, (const uint8_t*)payload, n, false);
  Serial.printf("%s %s\n", ok ? "→" : "✖", payload);
}
