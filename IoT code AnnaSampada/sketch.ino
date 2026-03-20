#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4

// Thresholds for ESP32 12-bit ADC (0-4095)
const int MQ135_THRESHOLD = 1200;  // Spoilage gases/VOCs [8]
const int MQ4_THRESHOLD = 1000;    // Methane/Decomposition [6]
const int MOISTURE_THRESHOLD = 2500; // High moisture risk [10]
const float TEMP_HIGH_RISK = 30.0; // Rapid mold growth zone [4]

LiquidCrystal_I2C lcd(0x27, 16, 2);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

int mq135Pin = 34;
int mq4Pin = 35;
int soilPin = 32;

void setup() {
  Serial.begin(115200);
  lcd.init();
  lcd.backlight();
  sensors.begin();

  lcd.setCursor(0, 0);
  lcd.print("Initializing...");
  delay(2000);
}

void loop() {
  // Data Acquisition
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  int gas1 = analogRead(mq135Pin);
  int gas2 = analogRead(mq4Pin);
  int moisture = analogRead(soilPin);

  // Spoilage Prediction Logic
  bool isSpoiled = false;
  String reason = "";

  if (gas2 > MQ4_THRESHOLD) {
    isSpoiled = true;
    reason = "Methane High";
  } else if (gas1 > MQ135_THRESHOLD) {
    isSpoiled = true;
    reason = "Gas/VOC High";
  } else if (temp > TEMP_HIGH_RISK && moisture > MOISTURE_THRESHOLD) {
    isSpoiled = true;
    reason = "Heat & Humid";
  }

  // LCD Update
  lcd.clear();
  
  // Row 0: Show primary gas and temp
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print((int)temp);
  lcd.print("C G:");
  lcd.print(gas1);

  // Row 1: Prediction Result
  lcd.setCursor(0, 1);
  if (isSpoiled) {
    lcd.print("SPOILED: ");
    lcd.print(reason);
    Serial.println("ALERT: Food Spoilage Detected! Reason: " + reason);
  } else {
    lcd.print("STATUS: FRESH");
    Serial.println("System Check: Food is Fresh");
  }

  delay(2000);
}