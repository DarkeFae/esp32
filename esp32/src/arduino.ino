#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>

#define DHTPIN 15
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

const char* ssid = "N-Tech 2.4";
const char* password = "zhaoy2b1";
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
    sleep(5);
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
        Serial.println("Failed to read from DHT sensor");
        return;
    }else{
        Serial.println("Temperature: " + String(t) + "°C");
    }
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        
        http.begin("http://" + String(serverIP) + ":" + String(serverPort) + "/your_endpoint");
        http.addHeader("Content-Type", "application/json");
        
        String json = "{\"name\": \"sensor1\"\"temperature\": " + String(t) + ", \"humidity\": " + String(h) + "}";
        int httpResponseCode = http.POST(json);
        
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