#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> 

const char* ssid = "Ayam Goreng H.Slamet";        // Ganti dengan SSID WiFi Anda
const char* password = "ayamayam"; // Ganti dengan Password WiFi Anda
const char* serverUrl = "http://192.168.102.150:3000/readings";
const char* serverActuator1Url = "http://192.168.102.150:3000/actions/1"; // Endpoint untuk mengambil perintah dari database
const char* serverActuator2Url = "http://192.168.102.150:3000/actions/2";

void connectToWiFi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }

    Serial.println("Connected to WiFi");
}

void sendCommandToArduino(const String &command) {
  Serial.println(command); // Make sure it ends with a newline character
}

void fetchActuatorCommand(const char* serverActuatorUrl, const String& relayIdentifier) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverActuatorUrl);
        int httpResponseCode = http.GET();

        if (httpResponseCode == 200) {
            String responseBody = http.getString();
            DynamicJsonDocument doc(1024);
            deserializeJson(doc, responseBody);
            const char* status = doc["status"]; // Asumsi ada field "status" di JSON

            // Kirim status dengan identifikasi relay ke Arduino
            Serial.print(relayIdentifier);
            Serial.println(status);
        } else {
            Serial.print("Error fetching actuator command: ");
            Serial.println(httpResponseCode);
        }
        http.end();
    } else {
        Serial.println("WiFi not connected!");
    }
}

void sendToServer(const String& suhuData) {
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        // Mengirim data ke server dalam format JSON
        DynamicJsonDocument doc(1024);
        JsonArray suhuArray = doc.createNestedArray("suhu");

        // Pisahkan data suhu yang diterima dan tambahkan ke JSON
        int start = 0;
        int end = suhuData.indexOf(',');
        int suhuIndex = 1;
        while (end != -1) {
            String suhu = suhuData.substring(start, end);
            doc["suhu" + String(suhuIndex)] = suhu.toFloat();
            start = end + 1;
            end = suhuData.indexOf(',', start);
            suhuIndex++;
        }
        // Tambahkan suhu terakhir
        doc["suhu" + String(suhuIndex)] = suhuData.substring(start).toFloat();

        String payload;
        serializeJson(doc, payload);

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

void readFromArduino() {
    if (Serial.available()) {
        String line = Serial.readStringUntil('\n');
        if (line.startsWith("Auto1:") || line.startsWith("Auto2:")) {
            sendRelayStatusToServer(line);
        }
    }
}

void sendRelayStatusToServer(const String& relayStatus) {
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        String serverEndPoint;
        
        if(relayStatus.startsWith("Auto1:")) {
            serverEndPoint = "http://192.168.102.150:3000/actions/auto/1";
        } else if(relayStatus.startsWith("Auto2:")) {
            serverEndPoint = "http://192.168.102.150:3000/actions/auto/2";
        } else {
            return; // Jika data tidak sesuai format, tidak dikirim
        }

        http.begin(serverEndPoint);
        http.addHeader("Content-Type", "text/plain");

        int httpResponseCode = http.POST(relayStatus);

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
    connectToWiFi();
}

void loop() {
    // Melakukan polling untuk perintah aktuator dari server
    fetchActuatorCommand(serverActuator1Url, "R1:");
    fetchActuatorCommand(serverActuator2Url, "R2:");

     if (Serial.available()) {
        // Membaca data dari Arduino
        String receivedData = Serial.readStringUntil('\n');
        if (receivedData.startsWith("TEMP:")) {
            String suhuData = receivedData.substring(5); // Hapus "TEMP:"
            sendToServer(suhuData);
        }
    }

    readFromArduino();

    //delay(5000); // Memberi jeda antara polling ke server dan pengiriman data
}
