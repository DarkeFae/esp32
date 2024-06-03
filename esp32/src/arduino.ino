#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "config.h"
#include <DNSServer.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

#define DHTPIN 15
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
AsyncWebServer server(3000);

void setup()
{
    Serial.begin(115200);
    Serial.println("connecting to: " + String(ssid) + " with password: " + String(password));
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    while (true)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            HTTPClient http;

            http.begin("http://" + String(serverIP) + ":3000/register");
            http.addHeader("Content-Type", "application/json");

            String json = "{\"name\": \"sensor1\", \"ip\": \"" + WiFi.localIP().toString() + "\"}";
            int httpResponseCode = http.POST(json);

            if (httpResponseCode > 0)
            {
                String response = http.getString();
                Serial.println("HTTP Response code: " + String(httpResponseCode));
                Serial.println("Response: " + response);
                break;
            }
            else
            {
                Serial.println("Error on HTTP request");
            }

            http.end();
        }
        Serial.println("Retrying in 30 seconds...");
        delay(30);
    }

    // Setup server routes
    server.on("/getdata", HTTP_GET, [](AsyncWebServerRequest *request)
              {
        String json = "{\"temperature\": " + String(getTemp()) + "\n, \"humidity\": " + String(getHumidity()) + "}";
        request->send(200, "application/json", json); 
        Serial.println("Request received");
        });

    // Start the server
    server.begin();
}

void loop()
{
}

int getTemp()
{
    float temp = dht.readTemperature();
    return temp;
}

int getHumidity()
{
    float humidity = dht.readHumidity();
    return humidity;
}