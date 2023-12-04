#include "max6675.h"

// Pin untuk komunikasi SPI dengan MAX6675
#define CLK_PIN 13
#define SO_PIN 12

// Pin CS untuk setiap sensor
#define CS_PIN1 2
#define CS_PIN2 3
#define CS_PIN3 4
#define CS_PIN4 7
#define CS_PIN5 6
#define CS_PIN6 5

// Pin untuk relay
#define RELAY1_PIN 10  // Relay 1 di pin 10
#define RELAY2_PIN 11  // Relay 2 di pin 11

// Membuat objek thermocouple
MAX6675 thermocouple1(CLK_PIN, CS_PIN1, SO_PIN);
MAX6675 thermocouple2(CLK_PIN, CS_PIN2, SO_PIN);
MAX6675 thermocouple3(CLK_PIN, CS_PIN3, SO_PIN);
MAX6675 thermocouple4(CLK_PIN, CS_PIN4, SO_PIN);
MAX6675 thermocouple5(CLK_PIN, CS_PIN5, SO_PIN);
MAX6675 thermocouple6(CLK_PIN, CS_PIN6, SO_PIN);

// Variabel untuk mengontrol relay dan pembacaan suhu
unsigned long lastToggleTime1 = 0;
unsigned long lastToggleTime2 = 0;
unsigned long lastSensorReadTime = 0;
const long relayOnInterval = 3000;  // 3 detik relay menyala
const long relayOffInterval = 3000; // 3 detik relay mati
const long sensorReadInterval = 1000; // 1 detik untuk pembacaan sensor
bool relay1State = LOW;
bool relay2State = LOW;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
}

void loop() {
  unsigned long currentMillis = millis();

  // Pembacaan suhu dari setiap sensor dengan jeda 1 detik
  if (currentMillis - lastSensorReadTime >= sensorReadInterval) {
    readSensorData();
    lastSensorReadTime = currentMillis;
  }

  // Mengontrol relay secara independen
  controlRelay(RELAY1_PIN, lastToggleTime1, relay1State, thermocouple1.readCelsius(), thermocouple2.readCelsius(), thermocouple3.readCelsius());
  controlRelay(RELAY2_PIN, lastToggleTime2, relay2State, thermocouple4.readCelsius(), thermocouple5.readCelsius(), thermocouple6.readCelsius());
}

void readSensorData() {
  static int sensorIndex = 1;
  switch (sensorIndex) {
    case 1:
      Serial.print("Sensor 1: "); Serial.println(thermocouple1.readCelsius()); //temp1 = thermocouple1.readCelsius()
      break;
    case 2:
      Serial.print("Sensor 2: "); Serial.println(thermocouple2.readCelsius()); //temp2 = thermocouple2.readCelsius()
      break;
    case 3:
      Serial.print("Sensor 3: "); Serial.println(thermocouple3.readCelsius()); //temp3 = thermocouple3.readCelsius()
      break;
    case 4:
      Serial.print("Sensor 4: "); Serial.println(thermocouple4.readCelsius());//temp4 = thermocouple4.readCelsius()
      break;
    case 5:
      Serial.print("Sensor 5: "); Serial.println(thermocouple5.readCelsius()); //temp5 = thermocouple5.readCelsius()
      break;
    case 6:
      Serial.print("Sensor 6: "); Serial.println(thermocouple6.readCelsius());//temp6 = thermocouple6.readCelsius()
      sensorIndex = 0; // Reset untuk memulai lagi dari sensor 1
      break;
  }
  //avg_node1 = (temp1+temp2+temp3) / 3; serial.println(avg_node1);
  //avg_node2 = (temp4+temp5+temp6) / 3; serial.println(avg_node2);

  sensorIndex++;
}

void controlRelay(int relayPin, unsigned long &lastToggleTime, bool &relayState, float temp1, float temp2, float temp3) {
  unsigned long currentMillis = millis();

  bool isTemperatureLow = (temp1 < 30 || temp2 < 30 || temp3 < 30); //kalibrasi ama cairan disini
  bool isTemperatureHigh = (temp1 > 60 || temp2 > 60 || temp3 > 60); //kalibrasi ama cairan disini

  if (isTemperatureLow) {
    if ((relayState == LOW && currentMillis - lastToggleTime >= relayOffInterval) ||
        (relayState == HIGH && currentMillis - lastToggleTime >= relayOnInterval)) {
      relayState = !relayState;
      digitalWrite(relayPin, relayState);
      lastToggleTime = currentMillis;
      Serial.print("Relay "); Serial.print(relayPin); Serial.println(relayState ? " ON" : " OFF");
    }
  } else if (isTemperatureHigh) {
    digitalWrite(relayPin, LOW);
  }
}
