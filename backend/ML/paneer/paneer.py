import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import joblib
import json
import warnings

warnings.filterwarnings('ignore', category=UserWarning)

print("--- Phase 1: Paneer Model Training Started ---")

# --- 1. Load Raw Dataset ---
try:
    df = pd.read_csv('paneer_spoilage_dataset.csv')
    print(f"Loaded raw dataset 'paneer_spoilage_dataset.csv'. Shape: {df.shape}")
except FileNotFoundError:
    print("ERROR: 'paneer_spoilage_dataset.csv' not found.")
    exit()

# --- 2. Define Target and Features ---
y = df['paneer_state']
X = df.drop('paneer_state', axis=1)

# --- 3. Pre-processing: Ordinal Encoding (Manual Mapping) ---
print("Applying Ordinal (Manual) Mappings...")
smell_map = {
    'Normal/Sweetish': 0,
    'Sour/Acidic': 1,
    'Foul/Ammoniacal': 2,
    'Soapy/Rancid': 3
}
texture_map = {
    'Normal/Firm': 0,
    'Hard/Rubbery': 1,
    'Slimy/Sticky': 2
}
X['observed_smell'] = X['observed_smell'].map(smell_map)
X['texture_surface'] = X['texture_surface'].map(texture_map)

# --- 4. Pre-processing: One-Hot Encoding (On/Off Switches) ---
print("Applying One-Hot Mappings...")
categorical_features = X.select_dtypes(include=['object', 'category']).columns
X_processed = pd.get_dummies(X, 
                             columns=categorical_features, 
                             drop_first=True)
print(f"Data pre-processed. New shape of X: {X_processed.shape}")

# --- 5. Save the Final Processed Data (for debugging) ---
X_processed_with_target = X_processed.copy()
X_processed_with_target['paneer_state'] = y
X_processed_with_target.to_csv('paneer_preprocessed.csv', index=False)
print("Saved 'paneer_preprocessed.csv' for review.")

# --- 6. Train/Test Split ---
print("Splitting data for training and testing...")
X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42, stratify=y)

# --- 7. Model Comparison ---
print("Defining models for comparison...")
models_to_test = {
    "Logistic Regression": LogisticRegression(
        multi_class='multinomial', 
        solver='lbfgs', 
        max_iter=1000, 
        random_state=42
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=100, 
        random_state=42
    ),
    "XGBoost": XGBClassifier(
        objective='multi:softmax',
        num_class=4,
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss'
    )
}

model_scores = {}
print("--- Starting Model Comparison 'Bake-Off' ---")
for model_name, model in models_to_test.items():
    print(f"Training {model_name}...")
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    model_scores[model_name] = score
    print(f"--- {model_name} Accuracy on Test Data (20%): {score * 100:.2f}% ---")

print("--- Model Comparison Complete ---")

best_model_name = max(model_scores, key=model_scores.get)
best_model_score = model_scores[best_model_name]
best_model_instance = models_to_test[best_model_name]

print(f"*** Best Model: {best_model_name} with {best_model_score * 100:.2f}% accuracy ***")

# --- 8. Retrain BEST Model on 100% of Data for Production ---
print(f"Retraining the best model ({best_model_name}) on 100% of data for production...")
production_model = best_model_instance
production_model.fit(X_processed, y)

# --- 9. Save Final Model & Column List for the API (NEW LOGIC) ---
print(f"Saving final model ({best_model_name}) and config files...")

# Create a dynamic, descriptive filename
best_model_filename = f"{best_model_name.lower().replace(' ', '_')}_paneer_model.joblib"
# e.g., 'random_forest_paneer_model.joblib'

# Save the trained model with its *actual* name
joblib.dump(production_model, best_model_filename)

# Save the column names
columns_list_filename = 'paneer_model_columns.json'
final_columns = X_processed.columns.tolist()
with open(columns_list_filename, 'w') as f:
    json.dump(final_columns, f)

# Create a new config file to tell the API which files to load
config = {
    "model_file": best_model_filename,
    "columns_file": columns_list_filename
}
with open('paneer_model_config.json', 'w') as f:
    json.dump(config, f, indent=2)


print("--- Phase 1 Complete! ---")
print(f"Saved '{best_model_filename}' (The Winning Model)")
print(f"Saved '{columns_list_filename}' (The Column List)")
print("Saved 'paneer_model_config.json' (The NEW API Config File)")

