import requests
import json

# Change this to your Render URL to test the live site
BASE_URL = "http://127.0.0.1:10000" 

def test_milk():
    print("\n--- Testing Milk Endpoint ---")
    url = f"{BASE_URL}/api/predict_milk"
    payload = {
        "milk_type": "Pasteurized (Pouch/Bottle)",
        "days_since_open_or_purchase": 2.0,
        "was_boiled": True,
        "storage_location": "Refrigerator",
        "cumulative_hours_at_room_temp": 1.0,
        "observed_smell": "Normal/Fresh",
        "observed_consistency": "Normal/Smooth"
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

def test_paneer():
    print("\n--- Testing Paneer Endpoint ---")
    url = f"{BASE_URL}/api/predict/paneer"
    payload = {
        "days_since_purchase_or_cooked": 3.0,
        "paneer_type": "Packaged",
        "storage_location": "Refrigerator",
        "storage_container_raw": "Not Applicable",
        "observed_smell": "Normal/Sweetish",
        "texture_surface": "Normal/Firm",
        "is_cooked": True
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    # Make sure your Flask app is running before executing this!
    test_milk()
    test_paneer()