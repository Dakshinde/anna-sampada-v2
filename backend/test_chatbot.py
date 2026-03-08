import requests
import json

# Using your local port
URL = "http://127.0.0.1:10000/api/chat"

def test_anna_chat(message):
    print(f"\n--- Testing Anna Chat: '{message}' ---")
    payload = {
        "message": message,
        "mode": "Veg",  # Testing your 'Veg' dietary mode logic
        "userId": "test_user_123"
    }
    
    try:
        response = requests.post(URL, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("Anna's Reply:", data.get('text'))
            # Check if structured JSON was parsed correctly
            if data.get('structured'):
                print("✅ Structured JSON received!")
                print(json.dumps(data['structured'], indent=2))
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    # Test a recipe request
    test_anna_chat("I have leftover rice and curd. Give me a recipe.")
    
    # Test a navigation command
    test_anna_chat("Predict Spoilage")