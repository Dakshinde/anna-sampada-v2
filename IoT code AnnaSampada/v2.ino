#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Pins
#define ONE_WIRE_BUS 4
const int MQ135_PIN = 34;
const int MQ4_PIN = 35;
const int SOIL_PIN = 32;

// Professional Calibration (Adjust these after 'Burn-in')
const int BASELINE_GAS = 400;   // Clean air value
const float WEIGHT_CH4 = 0.5;   // Methane is high-risk (50% weight)
const float WEIGHT_VOC = 0.3;   // VOCs are moderate-risk (30% weight)
const float WEIGHT_ENV = 0.2;   // Temp/Humidity is secondary (20% weight)

LiquidCrystal_I2C lcd(0x27, 16, 2);
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// EMA Filter Variables (Prevents data jumping)
float smoothCH4 = 0;
float smoothVOC = 0;
const float ALPHA = 0.1; // Filter strength (0 to 1)

void setup() {
  Serial.begin(115200);
  lcd.init();
  lcd.backlight();
  sensors.begin();
  
  lcd.setCursor(0, 0);
  lcd.print("ANNA INTELLIGENCE");
  lcd.setCursor(0, 1);
  lcd.print("Calibrating...");
  delay(3000); 
}

void loop() {
  sensors.requestTemperatures();
  float temp = sensors.getTempCByIndex(0);
  int rawCH4 = analogRead(MQ4_PIN);
  int rawVOC = analogRead(MQ135_PIN);

  // 1. Noise Reduction (EMA Filter)
  smoothCH4 = (ALPHA * rawCH4) + ((1.0 - ALPHA) * smoothCH4);
  smoothVOC = (ALPHA * rawVOC) + ((1.0 - ALPHA) * smoothVOC);

  // 2. Freshness Index Calculation (0 - 100%)
  // We normalize the gas values against the ESP32 12-bit ADC (4095)
  float ch4Risk = constrain(map(smoothCH4, BASELINE_GAS, 3000, 0, 100), 0, 100);
  float vocRisk = constrain(map(smoothVOC, BASELINE_GAS, 3000, 0, 100), 0, 100);
  
  float totalRisk = (ch4Risk * WEIGHT_CH4) + (vocRisk * WEIGHT_VOC);
  if (temp > 30.0) totalRisk += 15; // Heat Penalty
  
  int freshness = 100 - (int)totalRisk;
  freshness = constrain(freshness, 0, 100);

  // 3. Serial Output for your Flask/React Dashboard
  // Format: CH4,VOC,Temp,Freshness
  Serial.print(smoothCH4); Serial.print(",");
  Serial.print(smoothVOC); Serial.print(",");
  Serial.print(temp); Serial.print(",");
  Serial.println(freshness);

  // 4. Smart LCD Display
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Freshness: ");
  lcd.print(freshness);
  lcd.print("%");

  lcd.setCursor(0, 1);
  if (freshness > 75) lcd.print("STATUS: OPTIMAL");
  else if (freshness > 40) lcd.print("STATUS: CAUTION");
  else lcd.print("DANGER: SPOILED");

  delay(1500);
}
