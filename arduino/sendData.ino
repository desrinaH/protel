#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "";
const char* password = "";
const char* serverUrl = "http://192.168.178.150:3000/readings";

void connectToWiFi() {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
}

void sendToServer(float suhu) { //suhu[]
    if(WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        String payload = "{";
        payload += "\"node_id\":1,"; // Setting value 1 for node_id column
        payload += "\"suhu1\":" + String(suhu, 2); // Konversi float ke String dengan dua desimal
        payload += "\"suhu2\":" + String(suhu, 2);
        payload += "\"suhu3\":" + String(suhu, 2);
        payload += "\"suhu4\":" + String(suhu, 2);
        payload += "\"suhu5\":" + String(suhu, 2);
        payload += "\"suhu6\":" + String(suhu, 2);
        payload += "}";

        // String payload = "{";
        // for (int i = 0; i < 6; i++) {
        //     payload += "\"suhu" + String(i+1) + "\":" + String(suhus[i], 2);
        //     if (i < 5) payload += ",";
        // }
        // payload += "}";

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
    connectToWiFi();
}

void loop() {
    if (Serial.available()) {
        // Baca data dari Arduino
        String suhuData = Serial.readStringUntil('\n'); // Baca data sampai newline
        Serial.print("Data received: ");
        Serial.println(suhuData); // Cetak data yang diterima ke Serial Monitor

        // Konversi string ke float
        float suhu = suhuData.toFloat();
        //sendToServer(suhu); // Kirim data ke server
    }
}

// void loop() {
//     if (Serial.available()) {
//         // Baca data dari Arduino
//         String suhuData = Serial.readStringUntil('\n'); // Baca data sampai newline
//         float suhus[6];
//         int i = 0;
//         // Pisahkan data berdasarkan koma dan konversi ke float
//         int pos = 0;
//         while (pos != -1) {
//             int nextPos = suhuData.indexOf(',', pos);
//             suhus[i++] = suhuData.substring(pos, nextPos).toFloat();
//             pos = (nextPos >= 0) ? nextPos + 1 : -1;
//         }

//         // Sekarang Anda memiliki semua data suhu dalam array `suhus`
//         // Anda bisa mengirimnya satu per satu atau dalam format JSON
//         sendToServer(suhus);
//     }
// }
