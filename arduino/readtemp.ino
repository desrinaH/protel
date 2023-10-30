#include <WiFi.h>
#include <HTTPClient.h>
#include "max6675.h"

#define CLK_PIN 18  // SCK pin
#define SO_PIN 19   // SO (MISO) pin
#define LED_PIN 2   // Pin LED dihubungkan ke pin 2

// Pin CS untuk setiap sensor
#define CS_PIN1 4
#define CS_PIN2 5
#define CS_PIN3 21
#define CS_PIN4 22
#define CS_PIN5 23
#define CS_PIN6 25

MAX6675 thermocouple1(CLK_PIN, CS_PIN1, SO_PIN);
MAX6675 thermocouple2(CLK_PIN, CS_PIN2, SO_PIN);
MAX6675 thermocouple3(CLK_PIN, CS_PIN3, SO_PIN);
MAX6675 thermocouple4(CLK_PIN, CS_PIN4, SO_PIN);
MAX6675 thermocouple5(CLK_PIN, CS_PIN5, SO_PIN);
MAX6675 thermocouple6(CLK_PIN, CS_PIN6, SO_PIN);

unsigned long previousMillis = 0;
const long interval = 2000; // Interval waktu untuk membaca suhu (2 detik)

const char* ssid = "yourssid";
const char* password = "yourpassword";
const char* serverUrl = "http://192.168.38.150:3000/readings";

void connectToWiFi() {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
}

void sendToServer() {
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        String payload = "{";
        payload += "\"node_id\":1,"; // Setting value 1 for node_id column
        payload += "\"suhu1\":" + String(thermocouple1.readCelsius()) + ",";
        payload += "\"suhu2\":" + String(thermocouple1.readCelsius()) + ",";
        payload += "\"suhu3\":" + String(thermocouple1.readCelsius()) + ",";
        payload += "\"suhu4\":" + String(thermocouple1.readCelsius()) + ",";
        payload += "\"suhu5\":" + String(thermocouple1.readCelsius()) + ",";
        payload += "\"suhu6\":" + String(thermocouple1.readCelsius());
        payload += "}";

        int httpResponseCode = http.POST(payload);
        
        if (httpResponseCode > 0) {
            Serial.print("HTTP Response code: ");
            Serial.println(httpResponseCode);
        } else {
            Serial.print("Error code: ");
            Serial.println(httpResponseCode);
        }

        http.end();
    } else {
        Serial.println("WiFi not connected!");
    }
}


void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("MAX6675 multiple sensors test");
  delay(500); // Wait for MAX6675 to stabilize
  
  connectToWiFi();
}

void loop() {
  // Test readings from each sensor
  Serial.print("Sensor 1 - C: "); 
  Serial.println(thermocouple1.readCelsius());
  Serial.print("Sensor 2 - C: "); 
  Serial.println(thermocouple2.readCelsius());
  // ... [repeat for other sensors] ...

  sendToServer();  // Send data to the server

  // LED blink logic
  if (millis() - previousMillis >= interval) {
    previousMillis = millis();
    digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Toggle LED state
  }

  delay(1000);
}
