#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";
const char* serverIP = "192.168.1.92";
const int serverPort = 3000;

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    
    Serial.println("Connected to WiFi");
}

void loop() {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        http.begin("http://" + String(serverIP) + ":" + String(serverPort) + "/your_endpoint");
        http.addHeader("Content-Type", "application/json");
        
        int httpResponseCode = http.POST("{\"key\":\"value\"}");
        
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("HTTP Response code: " + String(httpResponseCode));
            Serial.println("Response: " + response);
        } else {
            Serial.println("Error on HTTP request");
        }
        
        http.end();
    }
    
    delay(5000);
}