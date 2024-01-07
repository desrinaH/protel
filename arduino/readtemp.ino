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

MAX6675 thermocouple1(CLK_PIN, CS_PIN1, SO_PIN);
MAX6675 thermocouple2(CLK_PIN, CS_PIN2, SO_PIN);
MAX6675 thermocouple3(CLK_PIN, CS_PIN3, SO_PIN);
MAX6675 thermocouple4(CLK_PIN, CS_PIN4, SO_PIN);
MAX6675 thermocouple5(CLK_PIN, CS_PIN5, SO_PIN);
MAX6675 thermocouple6(CLK_PIN, CS_PIN6, SO_PIN);

// Pin untuk relay
#define RELAY1_PIN 10
#define RELAY2_PIN 8
#define RELAY3_PIN 9

// Variabel global untuk pembacaan sensor
unsigned long lastReadTime = 0;
const long readInterval = 1000;
int sensorIndex = 1;

// Variabel global untuk kontrol relay
bool isHeatingAll = false;
unsigned long lastRelayToggle = 0;
const int toggleInterval = 3000;

float suhu[6];

// Variabel untuk kontrol manual
bool manualControl = false;
bool relay1ManualState = LOW;
bool relay2ManualState = LOW;
bool relay3ManualState = LOW;

unsigned long lastRelayToggled = RELAY1_PIN;

unsigned long lastRelayChange = 0;
const long relayChangeInterval = 5000;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  pinMode(RELAY3_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, LOW);
  digitalWrite(RELAY2_PIN, LOW);
  digitalWrite(RELAY3_PIN, LOW);
}

float readValidTemperature(MAX6675& thermocouple, MAX6675& nextThermocouple) {
  float temp = thermocouple.readCelsius();
  if (isnan(temp)) {
    return nextThermocouple.readCelsius();
  }
  return temp;
}

void readSensorData() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastReadTime >= readInterval) {
    switch (sensorIndex) {
      case 1:
        suhu[0] = readValidTemperature(thermocouple1, thermocouple2);
        break;
      case 2:
        suhu[1] = readValidTemperature(thermocouple2, thermocouple3);
        break;
      case 3:
        suhu[2] = readValidTemperature(thermocouple3, thermocouple4);
        break;
      case 4:
        suhu[3] = readValidTemperature(thermocouple4, thermocouple5);
        break;
      case 5:
        suhu[4] = readValidTemperature(thermocouple5, thermocouple6);
        break;
      case 6:
        suhu[5] = readValidTemperature(thermocouple6, thermocouple1);
        Serial.print("TEMP:");
        for (int i = 0; i < 6; i++) {
          Serial.print(suhu[i]);
          if (i < 5) Serial.print(",");
        }
        Serial.println();
        sensorIndex = 0;
        break;
    }
    lastReadTime = currentMillis;
    sensorIndex++;
  }
}

void checkForSerialCommands() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.startsWith("R1:")) {
      String status = command.substring(3);
      status.trim();
      if (status == "ON") {
        relay1ManualState = HIGH;
        manualControl = true;
      } else if (status == "OFF") {
        relay1ManualState = LOW;
        manualControl = true;
      } else if (status == "AUTO") {
        manualControl = false;
      }
      Serial.print("Status Relay 1: "); Serial.println(status);
    } else if (command.startsWith("R2:")) {
      String status = command.substring(3);
      status.trim();
      if (status == "ON") {
        relay2ManualState = HIGH;
        manualControl = true;
      } else if (status == "OFF") {
        relay2ManualState = LOW;
        manualControl = true;
      } else if (status == "AUTO") {
        manualControl = false;
      }
      Serial.print("Status Relay 2: "); Serial.println(status);
    } else if (command.startsWith("R3:")) {
      String status = command.substring(3);
      status.trim();
      if (status == "ON") {
        relay3ManualState = HIGH;
      } else if (status == "OFF") {
        relay3ManualState = LOW;
      }
      Serial.print("Status Relay 3: "); Serial.println(status);
    }
  }
}

void controlRelays() {
	
	digitalWrite(RELAY3_PIN, relay3ManualState);
	Serial.print("Kontrol Manual: Relay 3 = "); Serial.println(relay3ManualState);
	
  if (manualControl) {
    digitalWrite(RELAY1_PIN, relay1ManualState);
    digitalWrite(RELAY2_PIN, relay2ManualState);
    
    Serial.print("Kontrol Manual: Relay 1 = "); Serial.println(relay1ManualState);
    Serial.print("Kontrol Manual: Relay 2 = "); Serial.println(relay2ManualState);
    
  } else {
    // Add your automatic control logic here
	 // Kontrol otomatis
        float temp1 = thermocouple1.readCelsius();
        float temp2 = thermocouple2.readCelsius();
        float temp3 = thermocouple3.readCelsius();
        float temp4 = thermocouple4.readCelsius();
        float temp5 = thermocouple5.readCelsius();
        float temp6 = thermocouple6.readCelsius();
        
        float avg1 = (temp1 + temp2 + temp3) / 3;
        float avg2 = (temp4 + temp5 + temp6) / 3;

        bool flag1 = (avg1 < 50); //kalibrasi ini
        bool flag2 = (avg2 < 50); //kalibrasi ini 

        if (flag1 && flag2) {
            // Jika kedua grup sensor rendah, pilih salah satu relay untuk diaktifkan
            unsigned long currentMillis = millis();
            if (currentMillis - lastRelayChange >= relayChangeInterval) {
                if (lastRelayToggled == RELAY1_PIN) {
                    digitalWrite(RELAY1_PIN, LOW);
                    digitalWrite(RELAY2_PIN, HIGH);
                    lastRelayToggled = RELAY2_PIN;
                    Serial.print("Auto1:"); Serial.println(RELAY1_PIN);
                    Serial.print("Auto2:"); Serial.println(RELAY2_PIN);
                } else {
                    digitalWrite(RELAY1_PIN, HIGH);
                    digitalWrite(RELAY2_PIN, LOW);
                    lastRelayToggled = RELAY1_PIN;
                    Serial.print("Auto1:"); Serial.println(RELAY1_PIN);
                    Serial.print("Auto2:"); Serial.println(RELAY2_PIN);
                }
                lastRelayChange = currentMillis;  // Perbarui waktu terakhir pergantian relay
                Serial.println("Alternating Relays");
            }
        }
        else if (flag1) {
            digitalWrite(RELAY1_PIN, HIGH); // Nyalakan relay 1
            digitalWrite(RELAY2_PIN, LOW);  // Matikan relay 2
            lastRelayToggled = RELAY1_PIN;
            Serial.println("Sensor 1-3 Rendah");
            Serial.print("Auto1:"); Serial.println(RELAY1_PIN);
            Serial.print("Auto2:"); Serial.println(RELAY2_PIN);

        } else if (flag2) {
            digitalWrite(RELAY1_PIN, LOW);  // Matikan relay 1
            digitalWrite(RELAY2_PIN, HIGH); // Nyalakan relay 2
            lastRelayToggled = RELAY2_PIN;
            Serial.println("Sensor 4-6 Rendah");
            Serial.print("Auto1:"); Serial.println(RELAY1_PIN);
            Serial.print("Auto2:"); Serial.println(RELAY2_PIN);
        } else {
            digitalWrite(RELAY1_PIN, LOW); // Matikan relay 1
            digitalWrite(RELAY2_PIN, LOW); // Matikan relay 2
            Serial.println("Semua Sensor Tinggi");
            Serial.print("Auto1:"); Serial.println(RELAY1_PIN);
            Serial.print("Auto2:"); Serial.println(RELAY2_PIN);
        }
      
  }
}

void loop() {
  readSensorData();
  checkForSerialCommands();
  controlRelays();
}
