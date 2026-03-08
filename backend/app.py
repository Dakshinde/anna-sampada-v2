import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np 
import warnings
import json
import re
import time
import html
import uuid
import traceback # <-- FIX: Import traceback
from google import genai
from google.genai import types
import firebase_admin
from firebase_admin import credentials, firestore,initialize_app
from dotenv import load_dotenv
import googlemaps
import smtplib
from email.mime.text import MIMEText

# --- 1. INITIALIZATION ---
load_dotenv() 
warnings.filterwarnings('ignore')
app = Flask(__name__)

# Replace CORS(app) with this:
# This is more secure because it only trusts your specific domains
CORS(app, resources={r"/api/*": {
    "origins": [
        "http://localhost:5173",          # For local testing
        "https://annasampada.vercel.app" # For your live Vercel site
    ],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}}, supports_credentials=True)


# --- 2. INITIALIZE SERVICES (FIREBASE & GEMINI) ---


# Global db variable
db = None

def initialize_firebase():
    global db
    # Check if Firebase is already initialized to prevent multiple apps error
    if not firebase_admin._apps:
        try:
            # 1. TRY RENDER CONFIG FIRST (The Environment Variable)
            firebase_config = os.environ.get('FIREBASE_CONFIG')
            
            if firebase_config:
                cred_dict = json.loads(firebase_config)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                # This matches your other success messages
                print("✅ Firebase Admin SDK connected successfully via Render Env.")
            
            # 2. FALLBACK TO LOCAL FILE
            else:
                cert_path = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
                if os.path.exists(cert_path):
                    cred = credentials.Certificate(cert_path)
                    firebase_admin.initialize_app(cred)
                    print("✅ Firebase Admin SDK connected successfully via local JSON.")
                else:
                    print("❌ ERROR: No Firebase credentials found (Env or Local)!")
                    return None
            
            return firestore.client()
            
        except Exception as e:
            print(f"❌ Firebase Initialization Failed: {e}")
            return None
    else:
        # If apps already exist, just get the client for the existing app
        return firestore.client()
    
# IMPORTANT: Initialize the database at the global level
db = initialize_firebase()

# --- GEMINI API KEY ---
load_dotenv()

# --- 1. RESOLVE KEY CONFLICT ---
# If GOOGLE_API_KEY exists but is causing issues, we overwrite it with our known working key
working_key = os.getenv("GEMINI_API_KEY")
if working_key:
    os.environ["GOOGLE_API_KEY"] = working_key
    print(f"✅ Synced GOOGLE_API_KEY with GEMINI_API_KEY")

# --- 2. INITIALIZE CLIENT ---
# Don't pass the key in the constructor here; let the SDK pull from os.environ
try:
    client = genai.Client() # It will now automatically find the synced GOOGLE_API_KEY
    MODEL_NAME = "gemini-1.5-flash" # Using the most stable version for now
    print(f"✅ Gemini API configured via Environment")
except Exception as e:
    print(f"❌ Gemini Setup Failed: {e}")

# Initialize Google Maps
gmaps = None
try:
    gmaps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
    if not gmaps_api_key: raise ValueError("GOOGLE_MAPS_API_KEY not found in .env file.")
    gmaps = googlemaps.Client(key=gmaps_api_key)
    print("✅ Google Maps client initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Google Maps client: {e}")
    gmaps = None

# --- 3. LOAD ALL ML MODELS ---

# --- Rice Model ---
rice_model_path = os.path.join('ML', 'rice', 'rice_model.joblib')
try:
    rice_model = joblib.load(rice_model_path)
    print("--- Rice Model loaded successfully ---")
except Exception as e:
    rice_model = None
    print(f"Error loading Rice Model: {e}")

# --- Milk Model & Scaler ---
milk_model_path = os.path.join(os.path.dirname(__file__),'ML', 'milk', 'xgboost_milk_spoilage_model.joblib')
milk_scaler_path = os.path.join(os.path.dirname(__file__),'ML', 'milk', 'scaler_milk_spoilage.joblib')
try:
    milk_model = joblib.load(milk_model_path)
    milk_scaler = joblib.load(milk_scaler_path)
    print("--- Milk Model & Scaler loaded successfully ---")
except Exception as e:
    milk_model = None
    milk_scaler = None
    print(f"Error loading Milk Model/Scaler: {e}")

# --- Load Paneer Model and Config ---
paneer_model = None 
paneer_model_columns = [] 
paneer_model_dir = os.path.join('ML', 'paneer') 
paneer_config_filepath = os.path.join(paneer_model_dir, 'paneer_model_config.json') 
try:
    with open(paneer_config_filepath, 'r') as f:
        paneer_config = json.load(f)
    model_filepath = os.path.join(paneer_model_dir, paneer_config['model_file'])
    columns_filepath = os.path.join(paneer_model_dir, paneer_config['columns_file'])
    paneer_model = joblib.load(model_filepath)
    with open(columns_filepath, 'r') as f: 
        paneer_model_columns = json.load(f)
    print(f"--- PANEER MODEL LOADED ---")
except Exception as e: 
    print(f"FATAL ERROR: An error occurred loading the Paneer model or config: {e}")

# --- Roti Model ---
roti_model_path = os.path.join('ML', 'roti', 'roti_spoiler_pipeline.joblib') 
try:
    roti_pipeline = joblib.load(roti_model_path)
    print("--- Roti Pipeline loaded successfully ---")
except Exception as e:
    roti_pipeline = None
    print(f"Error loading Roti Pipeline: {e}")

# --- Dal Model & Components ---
dal_model_path = os.path.join('ML', 'dal', 'dal_spoilage_final_model.joblib')
dal_preprocessor_path = os.path.join('ML', 'dal', 'dal_spoilage_preprocessor.joblib')
dal_le_path = os.path.join('ML', 'dal', 'dal_spoilage_label_encoder.joblib')
try:
    dal_model = joblib.load(dal_model_path)
    dal_preprocessor = joblib.load(dal_preprocessor_path)
    dal_le = joblib.load(dal_le_path)
    print("--- Dal Model, Preprocessor, and LE loaded successfully ---")
except Exception as e:
    dal_model = None
    dal_preprocessor = None
    dal_le = None
    print(f"Error loading Dal components: {e}")



# --- 4. HELPER FUNCTIONS (PREPROCESSING & LOGGING) ---

# --- Firebase Logger ---
# In app.py, find log_chat_to_firestore
def log_chat_to_firestore(user_message, bot_response, mode, userId=None): # <-- Add userId
    global db
    if not db:
        print("Firestore not initialized. Skipping log.")
        return
    try:
        log_data = {
            'userMessage': user_message,
            'botResponse': bot_response.get('text', ''),
            'structuredResponse': bot_response.get('structured', {}),
            'mode': mode,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'userId': userId  # <-- ADD THIS LINE
        }
        db.collection('chat_logs').add(log_data)
        print("--- Chat log saved to Firebase ---")
    except Exception as e:
        print(f"Error logging to Firestore: {e}")

    
# --- RICE Helpers ---
rice_smell_map = { 'Normal': 0, 'Stale/Slightly Off': 1, 'Sour/Fermented': 2, 'Foul/Musty': 3 }
rice_appearance_map = { 'Normal/Glossy': 0, 'Dull/Dry': 1, 'Slimy/Discolored': 2, 'Visible Mold': 3 }
RICE_MODEL_FEATURES = [
    'hours_since_cooking', 'initial_hours_at_room_temp', 'smell_encoded', 'appearance_encoded',
    'storage_location_Refrigerator', 'storage_location_Room Temperature',
    'cooling_method_Cooled in shallow container', 'cooling_method_Left to cool in deep pot',
    'cooling_method_Not Applicable'
]
rice_result_map = {
    0.0: {'status': 'Fresh', 'message': 'Fresh - Safe to consume', 'is_safe': True},
    1.0: {'status': 'Stale', 'message': 'Stale - Safe but reduced quality', 'is_safe': True},
    2.0: {'status': 'Unsafe', 'message': 'Potentially Unsafe - Risk of toxins', 'is_safe': False},
    3.0: {'status': 'Spoiled', 'message': 'Spoiled - Do not consume', 'is_safe': False},
    4.0: {'status': 'Molded', 'message': 'Extremely Spoiled - Do not consume', 'is_safe': False}
}

def preprocess_and_validate_rice(data):
    try:
        hours_since_cooking = float(data['hours_since_cooking'])
        initial_hours = float(data['initial_hours_at_room_temp'])
    except ValueError:
        return None, "Error: Hour inputs must be numbers."
    except KeyError:
        return None, "Error: Missing required fields for rice."
    RICE_HOURS_CAP = 168
    if hours_since_cooking < 0 or initial_hours < 0:
        return None, "Error: Hours cannot be negative."
    if hours_since_cooking > RICE_HOURS_CAP:
        return rice_result_map[4.0], None 
    if initial_hours > hours_since_cooking:
        return None, "Error: 'Hours at Room Temp' cannot be greater than 'Total Hours Since Cooking'."
    storage = data.get('storage_location')
    cooling = data.get('cooling_method')
    smell = data.get('observed_smell')
    appearance = data.get('observed_appearance')
    if appearance == 'Visible Mold': return rice_result_map[4.0], None
    if appearance == 'Slimy/Discolored': return rice_result_map[3.0], None
    if smell in ['Sour/Fermented', 'Foul/Musty']: return rice_result_map[3.0], None
    smell_encoded = rice_smell_map.get(smell, 0)
    appearance_encoded = rice_appearance_map.get(appearance, 0)
    storage_location_Refrigerator = 1 if storage == 'Refrigerator' else 0
    storage_location_Room_Temperature = 1 if storage == 'Room Temperature' else 0
    cooling_method_Shallow = 1 if cooling == 'Cooled in shallow container' else 0
    cooling_method_Deep = 1 if cooling == 'Left to cool in deep pot' else 0
    cooling_method_NA = 1 if cooling == 'Not Applicable' else 0
    data_for_df = {
        'hours_since_cooking': [hours_since_cooking],
        'initial_hours_at_room_temp': [initial_hours],
        'smell_encoded': [smell_encoded],
        'appearance_encoded': [appearance_encoded],
        'storage_location_Refrigerator': [storage_location_Refrigerator],
        'storage_location_Room Temperature': [storage_location_Room_Temperature],
        'cooling_method_Cooled in shallow container': [cooling_method_Shallow],
        'cooling_method_Left to cool in deep pot': [cooling_method_Deep],
        'cooling_method_Not Applicable': [cooling_method_NA]
    }
    features_df = pd.DataFrame(columns=RICE_MODEL_FEATURES)
    features_df = pd.concat([features_df, pd.DataFrame(data_for_df)], ignore_index=True)
    features_df = features_df.fillna(0)
    features_df = features_df[RICE_MODEL_FEATURES] 
    return features_df, None

# --- MILK Helpers ---
milk_smell_order = ['Normal/Fresh', 'Sour', 'Bitter/Unpleasant', 'Rancid/Soapy']
milk_consistency_order = ['Normal/Smooth', 'Thicker than usual', 'Small Lumps', 'Thick Curds']
MILK_MODEL_FEATURES = [ 
    'days_since_open_or_purchase', 'was_boiled', 'cumulative_hours_at_room_temp',
    'observed_smell', 'observed_consistency', 'milk_type_Raw/Loose',
    'milk_type_UHT (Carton)', 'storage_location_Room Temperature'
]
MILK_SCALED_COLS = [ 
    'days_since_open_or_purchase', 'cumulative_hours_at_room_temp',
    'observed_smell', 'observed_consistency'
]
milk_result_map = {
    0: {'status': 'Fresh', 'message': '✅ Fresh - Safe to consume', 'is_safe': True},
    2: {'status': 'Spoiled', 'message': '🚫 Spoiled - Do not consume', 'is_safe': False}
}
MILK_SEVERE_SMELL = ['Rancid/Soapy']
MILK_SEVERE_CONSISTENCY = ['Thick Curds']

def preprocess_and_validate_milk(data):
    required_fields = [
        'milk_type', 'days_since_open_or_purchase', 'was_boiled', 'storage_location',
        'cumulative_hours_at_room_temp', 'observed_smell', 'observed_consistency'
    ]
    if not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return None, f"Error: Missing required fields for milk: {', '.join(missing)}"
    try:
        days = float(data['days_since_open_or_purchase'])
        room_temp_hours = float(data['cumulative_hours_at_room_temp'])
        if isinstance(data['was_boiled'], str):
            was_boiled_input = data['was_boiled'].lower() == 'true' or data['was_boiled'].lower() == 'yes'
        else:
            was_boiled_input = bool(data['was_boiled'])
    except (ValueError, TypeError):
        return None, "Error: Numeric inputs (days, hours) must be valid numbers."
    MILK_DAYS_CAP = 14 
    TOTAL_HOURS_IN_CAP = MILK_DAYS_CAP * 24 
    if days < 0 or room_temp_hours < 0:
         return None, "Error: Days and hours cannot be negative for milk."
    if days > MILK_DAYS_CAP:
        return milk_result_map[2], None 
    if room_temp_hours > (days * 24) + 1: 
        return None, "Error: 'Cumulative Hours at Room Temp' cannot be greater than total 'Days Since Purchase'."
    if room_temp_hours > TOTAL_HOURS_IN_CAP:
        return milk_result_map[2], None
    milk_type = data.get('milk_type')
    storage = data.get('storage_location')
    smell = data.get('observed_smell')
    consistency = data.get('observed_consistency')
    valid_milk_types = ['Pasteurized (Pouch/Bottle)', 'UHT (Carton)', 'Raw/Loose']
    valid_storage = ['Refrigerator', 'Room Temperature']
    if milk_type not in valid_milk_types: return None, f"Error: Invalid milk_type '{milk_type}'."
    if storage not in valid_storage: return None, f"Error: Invalid storage_location '{storage}'."
    if smell not in milk_smell_order: return None, f"Error: Invalid observed_smell '{smell}'."
    if consistency not in milk_consistency_order: return None, f"Error: Invalid observed_consistency '{consistency}'."
    if smell in MILK_SEVERE_SMELL or consistency in MILK_SEVERE_CONSISTENCY:
        return milk_result_map[2], None 
    try:
        smell_encoded = float(milk_smell_order.index(smell))
        consistency_encoded = float(milk_consistency_order.index(consistency))
    except ValueError:
         return None, "Error: Could not encode milk smell or consistency."
    was_boiled_encoded = 1 if was_boiled_input else 0
    milk_type_Raw_Loose = 1.0 if milk_type == 'Raw/Loose' else 0.0
    milk_type_UHT_Carton = 1.0 if milk_type == 'UHT (Carton)' else 0.0
    storage_location_Room_Temperature = 1.0 if storage == 'Room Temperature' else 0.0
    data_for_df = {
        'days_since_open_or_purchase': [days],
        'was_boiled': [was_boiled_encoded],
        'cumulative_hours_at_room_temp': [room_temp_hours],
        'observed_smell': [smell_encoded],
        'observed_consistency': [consistency_encoded],
        'milk_type_Raw/Loose': [milk_type_Raw_Loose],
        'milk_type_UHT (Carton)': [milk_type_UHT_Carton],
        'storage_location_Room Temperature': [storage_location_Room_Temperature]
    }
    try:
        features_df = pd.DataFrame(columns=MILK_MODEL_FEATURES)
        features_df = pd.concat([features_df, pd.DataFrame(data_for_df)], ignore_index=True)
        features_df = features_df.fillna(0.0)
        features_df = features_df[MILK_MODEL_FEATURES] 
    except Exception as e:
         return None, f"Error creating milk feature DataFrame: {str(e)}"
    if milk_scaler is None: return None, "Error: Milk Scaler is not loaded."
    try:
        features_df[MILK_SCALED_COLS] = milk_scaler.transform(features_df[MILK_SCALED_COLS])
    except Exception as e:
        return None, f"Error applying milk scaling: {str(e)}"
    
    # Force all columns to be numeric types (float/int)
    features_df = features_df.apply(pd.to_numeric, errors='coerce').fillna(0.0)
    
    return features_df, None
    

# --- DAL Helpers ---
def check_logical_spoilage_dal(time_hrs, storage, acidity, consistency, smell):
    if storage == 'Room Temperature' and time_hrs > 24:
        return True, "Stored at room temperature for over 24 hours."
    if time_hrs > 120: # 5 days
        return True, "Time since preparation exceeds the absolute safe limit of 120 hours."
    if storage == 'Room Temperature' and time_hrs >= 8 and acidity in ['High', 'Moderate']:
        return True, "Stored at room temperature for 8+ hours with high acidity."
    if smell in ['Very Sour', 'Musty', 'Foul']:
        return True, f"Reported {smell} smell, a strong spoilage indicator."
    if consistency == 'Slimy':
        return True, "Reported slimy consistency, a clear sign of microbial growth."
    return False, None

def get_chat_history(userId, limit=5):
    """Fetches the last 'limit' messages for a user from Firestore."""
    if not db or not userId:
        return []

    try:
        # Query Firestore
        docs = db.collection('chat_logs') \
            .where('userId', '==', userId) \
            .order_by('timestamp', direction=firestore.Query.DESCENDING) \
            .limit(limit) \
            .stream()

        history = []
        for doc in docs:
            data = doc.to_dict()
            # Add user message
            history.append({'role': 'user', 'parts': [data.get('userMessage')]})
            # Add bot response
            history.append({'role': 'model', 'parts': [data.get('botResponse', 'I do not recall.')]})
        
        # The history is newest-to-oldest, so we must reverse it
        history.reverse()
        return history

    except Exception as e:
        print(f"Error fetching history: {e}")
        return []
    
# --- 5. DEFINE API ENDPOINTS ---

# --- RICE Endpoint ---
@app.route('/api/predict', methods=['POST'])
def predict_rice():
    if rice_model is None: return jsonify({'error': 'Rice Model is not loaded.'}), 500
    try:
        data = request.json
        if not data: return jsonify({'error': 'No input data provided for rice'}), 400
        processed_input, error = preprocess_and_validate_rice(data)
        if error: return jsonify({'error': error, 'is_safe': False, 'status': 'Error'}), 400
        if isinstance(processed_input, dict): return jsonify(processed_input) 
        prediction_index = rice_model.predict(processed_input)[0]
        result = rice_result_map.get(float(prediction_index), {'status': 'Error', 'message': '🚫 Unknown prediction', 'is_safe': False})
        # --- [ADD THIS BLOCK TO LOG THE ML INPUT] ---
        if db:
            try:
                log_data = data.copy() # The raw user input
                log_data['prediction'] = result # The model's answer
                log_data['food_type'] = 'Rice'
                log_data['timestamp'] = firestore.SERVER_TIMESTAMP
                # You could also add a 'userId' if you send it from the frontend
                
                db.collection('predictions').add(log_data)
            except Exception as e:
                app.logger.error(f"ML Log Error: {e}") # Log error but don't fail
        # --- [END OF NEW BLOCK] ---
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Rice Prediction error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred.'}), 500

# --- MILK Endpoint ---
@app.route('/api/predict_milk', methods=['POST'])
def predict_milk():
    if milk_model is None: return jsonify({'error': 'Model not loaded'}), 500
    try:
        data = request.get_json()
        
        # 1. Capture was_boiled for the UI logic later
        was_boiled_raw = data.get('was_boiled')
        was_boiled_bool = was_boiled_raw.lower() in ['true', 'yes'] if isinstance(was_boiled_raw, str) else bool(was_boiled_raw)

        # 2. Run your massive preprocessing
        # This already handles scaling and returns a 2D DataFrame
        processed_df, error = preprocess_and_validate_milk(data)

        if error: return jsonify({'error': error}), 400
        
        # 3. Handle 'Instant Result' (if milk is already severe, it returns a dict)
        if isinstance(processed_df, dict):
            return jsonify(processed_df)

        # 4. Predict using the ALREADY SCALED DataFrame
        prediction_index = int(milk_model.predict(processed_df)[0])

        # 5. Logic for 'Starting to Spoil'
        if prediction_index == 1:
            if was_boiled_bool:
                result = {'status': 'Starting', 'message': '⚠️ Starting to Spoil - Re-boil before use.', 'is_safe': None}
            else:
                result = {'status': 'Unsafe', 'message': '❌ Potentially Unsafe - Discard.', 'is_safe': False}
        else:
            result = milk_result_map.get(prediction_index, {'status': 'Error', 'message': 'Unknown index', 'is_safe': False})

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f"Final Route Error: {str(e)}"}), 500
    
# --- PANEER Endpoint ---
@app.route('/api/predict/paneer', methods=['POST'])
def predict_paneer():
    global paneer_model, paneer_model_columns 
    if paneer_model is None or not paneer_model_columns: 
        return jsonify({'error': 'Paneer model or columns list not loaded properly.'}), 500
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided for paneer'}), 400
        input_df = pd.DataFrame([data])
        required_paneer_fields = ['days_since_purchase_or_cooked', 'is_cooked', 'paneer_type', 'storage_location', 'observed_smell', 'texture_surface']
        if not all(field in input_df.columns for field in required_paneer_fields):
            missing = [field for field in required_paneer_fields if field not in input_df.columns]
            return jsonify({'error': f"Missing required paneer fields: {', '.join(missing)}"}), 400
        try:
            days = float(data['days_since_purchase_or_cooked'])
        except (ValueError, TypeError):
            return jsonify({'error': "Error: 'Days' must be a valid number for paneer."}), 400
        PANEER_DAYS_CAP = 14 
        if days < 0:
            return jsonify({'error': "Error: 'Days' cannot be negative."}), 400
        if days > PANEER_DAYS_CAP:
            return jsonify({
                'status': "Spoiled (Do Not Eat)",
                'message': f"Paneer is unsafe after {PANEER_DAYS_CAP} days. Do not consume.",
                'is_safe': False, 'prediction_code': 3, 'confidence': "100.00%" 
            }), 200 
        smell_map = {'Normal/Sweetish': 0, 'Sour/Acidic': 1, 'Foul/Ammoniacal': 2, 'Soapy/Rancid': 3}
        texture_map = {'Normal/Firm': 0, 'Hard/Rubbery': 1, 'Slimy/Sticky': 2}
        if 'observed_smell' in input_df.columns:
            input_df['observed_smell'] = input_df['observed_smell'].map(smell_map).astype('Int64').astype(float) 
        if 'texture_surface' in input_df.columns:
            input_df['texture_surface'] = input_df['texture_surface'].map(texture_map).astype('Int64').astype(float) 
        numeric_cols = ['days_since_purchase_or_cooked']
        for col in numeric_cols:
            if col in input_df.columns:
                input_df[col] = pd.to_numeric(input_df[col], errors='coerce').fillna(0).astype(float) 
        all_categorical_cols = ['is_cooked', 'paneer_type', 'storage_location', 'storage_container_raw']
        categorical_features_in_input = [col for col in all_categorical_cols if col in input_df.columns]
        for col in categorical_features_in_input:
            input_df[col] = input_df[col].astype('category')
        input_df_processed = pd.get_dummies(input_df, columns=categorical_features_in_input, drop_first=True)
        final_input_df = pd.DataFrame(columns=paneer_model_columns)
        final_input_df = pd.concat([final_input_df, input_df_processed], ignore_index=True)
        final_input_df = final_input_df.fillna(0.0).astype(float) 
        try:
            final_input_df = final_input_df[paneer_model_columns]
        except KeyError as e:
            app.logger.error(f"Column mismatch error: {e}")
            return jsonify({'error': f"Internal server error: Column mismatch. Missing: {e}"}), 500
        prediction_code = paneer_model.predict(final_input_df)[0]
        prediction_proba = paneer_model.predict_proba(final_input_df)[0]
        confidence = max(prediction_proba) * 100
        status_map = { 0: "Fresh", 1: "Good (Use Soon)", 2: "Stale (Use with Caution)", 3: "Spoiled (Do Not Eat)" }
        status = status_map.get(int(prediction_code), "Unknown")
        message = f"Prediction: {status}. Confidence: {confidence:.2f}%"
        is_safe = bool(int(prediction_code) < 3) 

        
        return jsonify({
            'status': status, 'message': message, 'is_safe': is_safe,
            'prediction_code': int(prediction_code), 'confidence': f"{confidence:.2f}%"
        })
    except Exception as e:
        app.logger.error(f"Paneer Prediction error: {str(e)}") 
        return jsonify({'error': f'An error occurred during paneer prediction: {str(e)}'}), 500

# --- DAL Endpoint ---
@app.route('/api/predict_dal', methods=['POST'])
def predict_dal():
    if not all([dal_model, dal_preprocessor, dal_le]):
        return jsonify({'error': 'Dal Model components not loaded.'}), 500
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No input data provided for dal'}), 400
        is_logically_spoiled, reason = check_logical_spoilage_dal(
            time_hrs=float(data['Time_since_preparation_hours']),
            storage=data['Storage_place'],
            acidity=data['Acidity_source'],
            consistency=data['Consistency'],
            smell=data['Smell']
        )
        if is_logically_spoiled:
            return jsonify({
                'status': 'Spoiled', 
                'message': f'Spoiled (Food Safety Rule): {reason}', 
                'is_safe': False
            })
        input_df = pd.DataFrame([data])
        processed_input = dal_preprocessor.transform(input_df)
        prediction_code = dal_model.predict(processed_input)[0]
        prediction_proba = dal_model.predict_proba(processed_input)[0]
        result_label = dal_le.inverse_transform([prediction_code])[0] 
        is_spoiled = (result_label == 'Spoiled')
        confidence = prediction_proba[prediction_code] * 100 
        if is_spoiled:
            result = {'status': 'Spoiled', 'message': f'ML Result: Spoiled. (Confidence: {confidence:.2f}%)', 'is_safe': False}
        else:
            result = {'status': 'Fresh', 'message': f'ML Result: Fresh. (Confidence: {confidence:.2f}%)', 'is_safe': True}

        # --- [COPY THIS BLOCK] ---
        if db:
            try:
                log_data = data.copy() # The raw user input
                log_data['prediction'] = result # The model's answer
                log_data['food_type'] = 'Dal' # <-- CHANGE THIS FOR EACH ROUTE
                log_data['timestamp'] = firestore.SERVER_TIMESTAMP
                # You can also add: log_data['userId'] = data.get('userId')
                
                db.collection('predictions').add(log_data)
            except Exception as e:
                app.logger.error(f"ML Log Error: {e}") # Log error but don't fail
        # --- [END OF BLOCK] ---
            
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Dal Prediction error: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

# --- ROTI Endpoint ---
@app.route('/api/predict_roti', methods=['POST'])
def predict_roti():
    if roti_pipeline is None:
        return jsonify({'error': 'Roti Model is not loaded.'}), 500
    try:
        data = request.json
        input_df = pd.DataFrame([data]) 
        prediction = roti_pipeline.predict(input_df)[0]
        probability = roti_pipeline.predict_proba(input_df)[0]
        
        is_spoiled = (prediction == 1) 
        confidence = probability[1] if is_spoiled else probability[0]
        
        result = {
            'status': 'Spoiled' if is_spoiled else 'Fresh',
            'message': f"{'Spoiled' if is_spoiled else 'Fresh'} - ...",
            'is_safe': not is_spoiled
        }

        # Log to DB before returning
        if db:
            try:
                log_data = data.copy()
                log_data['prediction'] = result
                log_data['food_type'] = 'Roti'
                log_data['timestamp'] = firestore.SERVER_TIMESTAMP
                db.collection('predictions').add(log_data)
            except Exception as e:
                app.logger.error(f"ML Log Error: {e}")

        return jsonify(result) # Now the return is at the end
    
    except Exception as e:
        app.logger.error(f"Roti Prediction error: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    # 1. Pull the key and verify it's not empty
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not key:
        return jsonify({'error': 'Critical: API Key not found in .env'}), 500

    # 2. THE FIX: Explicitly pass the key AND disable vertex/cloud detection
    # This forces the SDK to use the API key provided here and nowhere else.
    local_client = genai.Client(
        api_key=key,
        http_options={'headers': {'x-goog-api-key': key}} 
    )

    try:
        payload = request.get_json() or {}
        user_message = (payload.get('message') or '').strip()
        mode = (payload.get('mode') or 'Veg').lower()
        userId = payload.get('userId')

        # --- SYSTEM PROMPT ---
        dietary_rules = {
            'jain': "Rules: NO meat/fish/eggs/onion/garlic/root-veg.",
            'veg': "Rules: NO meat/fish/eggs. Onion/Garlic/Dairy OK.",
            'non-veg': "Rules: All food/meat/eggs allowed."
        }.get(mode, "Rules: Veg mode.")

        system_instruction = f"""
        You are Anna, a food assistant. {dietary_rules}
        Return ONLY JSON.
        Recipe: {{"type":"recipe","title":"","ing":[],"steps":[]}}
        Safety: {{"type":"safety","tips":[]}}
        Navigation: {{"command":"navigate","payload":"/predict"}}
        """

        # --- HISTORY SAFETY ---
        raw_history = get_chat_history(userId)[-4:] if userId else []
        formatted_contents = []
        for entry in raw_history:
            role = 'model' if entry['role'] in ['assistant', 'bot', 'model'] else 'user'
            # Extract text safely from stored history parts
            text_parts = [types.Part.from_text(text=p['text'] if isinstance(p, dict) else str(p)) 
                         for p in entry.get("parts", [])]
            formatted_contents.append(types.Content(role=role, parts=text_parts))

        formatted_contents.append(types.Content(
            role='user', 
            parts=[types.Part.from_text(text=user_message)]
        ))

        # --- THE CALL WITH RETRY PROTECTION ---
        response = None
        for attempt in range(2):
            try:
                response = local_client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=formatted_contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3,
                        response_mime_type="application/json"
                    )
                )
                break
            except Exception as e:
                if attempt == 0: 
                    time.sleep(1)
                    continue
                raise e

        # --- SAFER PARSING ---
        try:
            ai_json = json.loads(response.text)
        except (json.JSONDecodeError, AttributeError):
            ai_json = {"replyText": response.text if response else "Error", "type": "message"}

        return jsonify({
            "text": ai_json.get("replyText", response.text if response else ""),
            "structured": ai_json
        })

    except Exception as e:
        print(f"❌ CHAT ERROR: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
             
# --- [NEW] USER AUTH ENDPOINTS ---

@app.route('/api/signup', methods=['POST'])
def signup():
    global db
    if db is None:
        db = initialize_firebase()  # Try one last time to connect
        if db is None:
            return jsonify({"error": "Database connection failed"}), 500
        
    data = request.get_json()
    email = data.get('email')
    password = data.get('password') # In a real app, you MUST hash this!
    role = data.get('role', 'user') # e.g., 'user', 'ngo'

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Check if user already exists
        user_ref = db.collection('users').where('email', '==', email).get()
        if len(user_ref) > 0:
            return jsonify({"error": "User with this email already exists"}), 400
        
        # Create new user
        # We use the email as the document ID for easy lookup
        user_doc = db.collection('users').document(email)
        user_doc.set({
            'email': email,
            'password': password, # Again, HASH THIS in a real project
            'role': role,
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # Return the new user data (without password)
        return jsonify({"status": "success", "email": email, "role": role}), 201
        
    except Exception as e:
        app.logger.error(f"Signup Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    global db
    if db is None:
        db = initialize_firebase()  # Try one last time to connect
        if db is None:
            return jsonify({"error": "Database connection failed"}), 500
        
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Find the user by their email (which is the document ID)
        user_doc = db.collection('users').document(email).get()
        
        if not user_doc.exists:
            return jsonify({"error": "Invalid email or password"}), 401
            
        user_data = user_doc.to_dict()
        
        # Check password (this is unsafe, but fine for a demo)
        if user_data.get('password') == password:
            # Send back user info (but not the password)
            return jsonify({
                "status": "success",
                "email": user_data.get('email'),
                "role": user_data.get('role')
            }), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
            
    except Exception as e:
        app.logger.error(f"Login Error: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500
    
# --- NGO & DONATION ENDPOINTS ---

@app.route('/api/get-ngos', methods=['GET'])
def get_ngos():
    if not gmaps: 
        return jsonify({"error": "Google Maps service is not configured"}), 500
    try:
        # Get location from query parameters (e.g., /api/get-ngos?lat=19.2&lng=72.8)
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        
        if not lat or not lng:
            return jsonify({"error": "Latitude and longitude are required"}), 400

        # Search for NGOs nearby
        places_result = gmaps.places_nearby(
            location=(lat, lng), 
            radius=5000, # 5km radius
            keyword='NGO OR food bank OR food donation'
        )
        
        ngos_list = []
        for place in places_result.get('results', []):
            place_id = place['place_id']
            # We need to make a second call to get the phone number and email
            # This is slow, so we'll just get the basics for the demo
            # In a real app, you'd fetch details
            ngos_list.append({
                "id": place_id, 
                "name": place.get('name'), 
                "address": place.get('vicinity', 'Address not available'),
                "location": place['geometry']['location']
            })

        return jsonify(ngos_list)
    except Exception as e:
        app.logger.error(f"Google Maps Error: {e}")
        return jsonify({"error": str(e)}), 500


# In app.py
@app.route('/api/notify-ngo', methods=['POST'])
def notify_ngo():
    try:
        data = request.get_json()
        
        # --- [THIS IS THE FIX] ---
        # The frontend is sending 'donorContact', 'foodDetails', 'pickupAddress'
        ngo_name = data['ngo_name']
        donor_contact = data['donorContact']     # Use camelCase
        food_details = data['foodDetails']       # Use camelCase
        pickup_address = data['pickupAddress']   # Use camelCase
        # --- [END OF FIX] ---
        
        recipient_email = os.getenv("EMAIL_SENDER") 
        sender_email = os.getenv("EMAIL_SENDER")
        sender_password = os.getenv("EMAIL_APP_PASSWORD")
        
        if not sender_email or not sender_password: 
            return jsonify({"error": "Email service not configured on server."}), 500
            
        subject = f"New Food Donation Alert from Anna Sampada for {ngo_name}!"
        body = f"""
        Hello {ngo_name},
        A donor has offered a food donation via the Anna Sampada app.
        
        --- DONATION DETAILS ---
        Food: {food_details}
        Pickup Address: {pickup_address}
        Donor Contact (Phone/Email): {donor_contact}
        
        Please coordinate pickup directly with the donor.
        Thank you,
        The Anna Sampada Team
        """
        
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = recipient_email 
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
            s.login(sender_email, sender_password)
            s.sendmail(sender_email, recipient_email, msg.as_string())
            
        return jsonify({"status": "success", "message": f"Notification successfully sent to {ngo_name} (demo)"})
        
    except KeyError as e:
        app.logger.error(f"KeyError in notify_ngo: {str(e)}")
        return jsonify({"error": f"Missing key in request: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"Email Error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500
    
# --- 6. RUN THE APP ---
if __name__ == '__main__':
    # Startup checks for models
    # This helps you debug "Status 128" by checking files BEFORE the app starts
    script_dir = os.path.dirname(__file__) if '__file__' in locals() else '.' 
    
    roti_model_check = os.path.join(script_dir, 'ML', 'roti', 'roti_spoiler_pipeline.joblib')
    dal_model_check = os.path.join(script_dir, 'ML', 'dal', 'dal_spoilage_final_model.joblib')
    
    if not os.path.exists(roti_model_check): 
        print(f"⚠️ Warning: Roti model NOT found at {roti_model_check}")
    if not os.path.exists(dal_model_check): 
        print(f"⚠️ Warning: Dal model NOT found at {dal_model_check}")

    # PRODUCTION CONFIGURATION
    # Render assigns a port via the PORT environment variable
    render_port = int(os.environ.get("PORT", 10000)) 
    
    # We use 0.0.0.0 so the server is accessible externally
    app.run(host='0.0.0.0', port=render_port, debug=False)