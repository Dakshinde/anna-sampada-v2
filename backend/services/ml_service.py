import os
import joblib
import json
import pandas as pd

# Global variables to hold models so they can be accessed by the endpoints
models = {
    'rice': None,
    'milk': None,
    'milk_scaler': None,
    'paneer': None,
    'paneer_columns': [],
    'roti_pipeline': None,
    'dal_model': None,
    'dal_preprocessor': None,
    'dal_le': None
}

def load_all_models():
    """Initializes all ML models at server startup."""
    global models
    
    # --- Rice Model ---
    try:
        models['rice'] = joblib.load(os.path.join('ML', 'rice', 'rice_model.joblib'))
        print("✅ Rice Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading Rice Model: {e}")

    # --- Milk Model & Scaler ---
    try:
        models['milk'] = joblib.load(os.path.join('ML', 'milk', 'xgboost_milk_spoilage_model.joblib'))
        models['milk_scaler'] = joblib.load(os.path.join('ML', 'milk', 'scaler_milk_spoilage.joblib'))
        print("✅ Milk Model & Scaler loaded successfully")
    except Exception as e:
        print(f"❌ Error loading Milk Model/Scaler: {e}")

    # --- Paneer Model and Config ---
    paneer_dir = os.path.join('ML', 'paneer') 
    paneer_config_path = os.path.join(paneer_dir, 'paneer_model_config.json') 
    try:
        with open(paneer_config_path, 'r') as f:
            paneer_config = json.load(f)
        models['paneer'] = joblib.load(os.path.join(paneer_dir, paneer_config['model_file']))
        with open(os.path.join(paneer_dir, paneer_config['columns_file']), 'r') as f: 
            models['paneer_columns'] = json.load(f)
        print("✅ PANEER MODEL LOADED")
    except Exception as e: 
        print(f"❌ FATAL ERROR: Paneer model/config loading failed: {e}")

    # --- Roti Model ---
    try:
        models['roti_pipeline'] = joblib.load(os.path.join('ML', 'roti', 'roti_spoiler_pipeline.joblib'))
        print("✅ Roti Pipeline loaded successfully")
    except Exception as e:
        print(f"❌ Error loading Roti Pipeline: {e}")

    # --- Dal Model & Components ---
    try:
        models['dal_model'] = joblib.load(os.path.join('ML', 'dal', 'dal_spoilage_final_model.joblib'))
        models['dal_preprocessor'] = joblib.load(os.path.join('ML', 'dal', 'dal_spoilage_preprocessor.joblib'))
        models['dal_le'] = joblib.load(os.path.join('ML', 'dal', 'dal_spoilage_label_encoder.joblib'))
        print("✅ Dal components loaded successfully")
    except Exception as e:
        print(f"❌ Error loading Dal components: {e}")

    return models

# --- RICE CONSTANTS ---
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

# --- MILK CONSTANTS ---
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

## --- RICE HELPER ---
def preprocess_and_validate_rice(data):
    try:
        hours_since_cooking = float(data['hours_since_cooking'])
        initial_hours = float(data['initial_hours_at_room_temp'])
    except (ValueError, KeyError):
        return None, "Error: Invalid or missing hour inputs."
    
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

def preprocess_and_validate_milk(data):
    # 1. Correctly access the scaler from the global dictionary
    scaler = models.get('milk_scaler')
    if not scaler:
        return None, "Error: Milk Scaler not initialized in ml_service."

    required_fields = [
        'milk_type', 'days_since_open_or_purchase', 'was_boiled', 'storage_location',
        'cumulative_hours_at_room_temp', 'observed_smell', 'observed_consistency'
    ]
    
    # 2. Basic Validation
    if not all(field in data for field in required_fields):
        missing = [field for field in required_fields if field not in data]
        return None, f"Error: Missing fields: {', '.join(missing)}"

    try:
        days = float(data['days_since_open_or_purchase'])
        room_temp_hours = float(data['cumulative_hours_at_room_temp'])
        was_boiled_input = str(data['was_boiled']).lower() in ['true', 'yes', '1']
    except (ValueError, TypeError):
        return None, "Error: Numeric inputs (days, hours) must be valid numbers."

    # 3. Logic Caps (Ensuring safety before ML)
    if days > 14 or room_temp_hours > (14 * 24):
        return milk_result_map[2], None 

    # 4. Severe Spoilage Hard-Coded Checks
    if data.get('observed_smell') in MILK_SEVERE_SMELL or \
       data.get('observed_consistency') in MILK_SEVERE_CONSISTENCY:
        return milk_result_map[2], None 

    # 5. Encoding and DataFrame Creation
    try:
        smell_encoded = float(milk_smell_order.index(data['observed_smell']))
        consistency_encoded = float(milk_consistency_order.index(data['observed_consistency']))
        
        data_for_df = {
            'days_since_open_or_purchase': [days],
            'was_boiled': [1 if was_boiled_input else 0],
            'cumulative_hours_at_room_temp': [room_temp_hours],
            'observed_smell': [smell_encoded],
            'observed_consistency': [consistency_encoded],
            'milk_type_Raw/Loose': [1.0 if data['milk_type'] == 'Raw/Loose' else 0.0],
            'milk_type_UHT (Carton)': [1.0 if data['milk_type'] == 'UHT (Carton)' else 0.0],
            'storage_location_Room Temperature': [1.0 if data['storage_location'] == 'Room Temperature' else 0.0]
        }
        
        features_df = pd.DataFrame(data_for_df)
        # Ensure column order matches training
        features_df = features_df[MILK_MODEL_FEATURES]
        
        # 6. Scaling
        features_df[MILK_SCALED_COLS] = scaler.transform(features_df[MILK_SCALED_COLS])
        
        return features_df, None
    except Exception as e:
        return None, f"Internal Processing Error: {str(e)}"

# --- DAL HELPER ---
def check_logical_spoilage_dal(time_hrs, storage, acidity, consistency, smell):
    if storage == 'Room Temperature' and time_hrs > 24:
        return True, "Stored at room temperature for over 24 hours."
    
    return False, None
