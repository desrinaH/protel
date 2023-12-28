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
#define RELAY1_PIN 10  // Relay 1 di pin 10
#define RELAY2_PIN 11  // Relay 2 di pin 11

// Variabel global untuk pembacaan sensor
unsigned long lastReadTime = 0; // Waktu terakhir sensor dibaca
const long readInterval = 1000; // Jeda satu detik
int sensorIndex = 1; // Sensor yang akan dibaca

// Variabel global untuk kontrol relay
bool isHeatingAll = false;
unsigned long lastRelayToggle = 0;
const int toggleInterval = 3000; // Jeda antar relay saat heating all

float suhu[6];

// Variabel untuk kontrol manual
bool manualControl = false;
bool relay1ManualState = LOW;
bool relay2ManualState = LOW;

void setup() {
  Serial.begin(9600);
  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, LOW);
  digitalWrite(RELAY2_PIN, LOW);
}

float readValidTemperature(MAX6675& thermocouple, MAX6675& nextThermocouple) {
    float temp = thermocouple.readCelsius();
    if (isnan(temp)) {
        // Jika data NaN, ambil data dari sensor sebelahnya
        return nextThermocouple.readCelsius();
    }
    return temp;
}

void readSensorData() {
    static unsigned long lastReadTime = 0;
    static int sensorIndex = 1;
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
                // Setelah semua sensor dibaca, kirim data suhu ke ESP32
                Serial.print("TEMP:");
                for (int i = 0; i < 6; i++) {
                    Serial.print(suhu[i]);
                    if (i < 5) Serial.print(",");
                }
                Serial.println();
                sensorIndex = 0; // Reset untuk memulai lagi dari sensor 1
                break;
        }
        lastReadTime = currentMillis;
        sensorIndex++;
    }
}

void checkForSerialCommands() {
    if (Serial.available()) {
        String command = Serial.readStringUntil('\n');
        command.trim(); // Menghapus spasi dan karakter newline

        if (command.startsWith("R1:")) {
            String status = command.substring(3);
            status.trim(); // Membersihkan string status
            if (status == "ON") {
                relay1ManualState = HIGH;
                manualControl = true;
            } else if (status == "OFF") {
                relay1ManualState = LOW;
                manualControl = true;
            } else if (status == "AUTO") {
                manualControl = false;
            }
            // Debugging
            Serial.print("Status Relay 1: "); Serial.println(status);
        } else if (command.startsWith("R2:")) {
            String status = command.substring(3);
            status.trim(); // Membersihkan string status
            if (status == "ON") {
                relay2ManualState = HIGH;
                manualControl = true;
            } else if (status == "OFF") {
                relay2ManualState = LOW;
                manualControl = true;
            } else if (status == "AUTO") {
                manualControl = false;
            }
            // Debugging
            Serial.print("Status Relay 2: "); Serial.println(status);
        }
    }
}


void controlRelays() {
    if (manualControl) {
        // Kontrol manual
        digitalWrite(RELAY1_PIN, relay1ManualState);
        digitalWrite(RELAY2_PIN, relay2ManualState);
        // Debugging
        Serial.print("Kontrol Manual: Relay 1 = "); Serial.println(relay1ManualState);
        Serial.print("Kontrol Manual: Relay 2 = "); Serial.println(relay2ManualState);
    } else {
        // Kontrol otomatis
        float temp1 = thermocouple1.readCelsius();
        float temp2 = thermocouple2.readCelsius();
        float temp3 = thermocouple3.readCelsius();
        float temp4 = thermocouple4.readCelsius();
        float temp5 = thermocouple5.readCelsius();
        float temp6 = thermocouple6.readCelsius();

        bool flag1 = (temp1 < 50 && temp2 < 50 && temp3 < 50);
        bool flag2 = (temp4 < 50 && temp5 < 50 && temp6 < 50);

        unsigned long currentMillis = millis();

        if (flag1 && flag2) {
            isHeatingAll = true; // Semua sensor menunjukkan suhu rendah
            Serial.println("Semua Sensor Rendah");
        } else if (flag1) {
            digitalWrite(RELAY1_PIN, HIGH); // Nyalakan relay 1
            digitalWrite(RELAY2_PIN, LOW);  // Matikan relay 2
            isHeatingAll = false;
            Serial.println("Sensor 1-3 Rendah");
        } else if (flag2) {
            digitalWrite(RELAY1_PIN, LOW);  // Matikan relay 1
            digitalWrite(RELAY2_PIN, HIGH); // Nyalakan relay 2
            isHeatingAll = false;
            Serial.println("Sensor 4-6 Rendah");
        } else {
            digitalWrite(RELAY1_PIN, LOW); // Matikan relay 1
            digitalWrite(RELAY2_PIN, LOW); // Matikan relay 2
            isHeatingAll = false;
            Serial.println("Semua Sensor Tinggi");
        }

        // Logika untuk "pemanasan semua"
        if (isHeatingAll && currentMillis - lastRelayToggle >= toggleInterval) {
            digitalWrite(RELAY1_PIN, !digitalRead(RELAY1_PIN));
            digitalWrite(RELAY2_PIN, !digitalRead(RELAY2_PIN));
            lastRelayToggle = currentMillis;
        }
    }
}


void loop() {
    readSensorData();
    checkForSerialCommands();
    Serial.print("manualcontrolnya=");Serial.println(manualControl);
    controlRelays();
}
