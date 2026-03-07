import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
import sys
import joblib
import os

# --- 1. Data Loading ---
file_path = 'rice_spoilage_dataset.csv'
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"Error: The file '{file_path}' was not found.")
    print("Please make sure the dataset file is in the same directory as this script.")
    sys.exit()

print("--- Data Loaded Successfully ---")

# --- 2. Data Preprocessing ---

# Ordinal Encoding: Define the order of severity
smell_map = {
    'Normal': 0,
    'Stale/Slightly Off': 1,
    'Sour/Fermented': 2,
    'Foul/Musty': 3
}

appearance_map = {
    'Normal/Glossy': 0,
    'Dull/Dry': 1,
    'Slimy/Discolored': 2,
    'Visible Mold': 3
}

df['smell_encoded'] = df['observed_smell'].map(smell_map)
df['appearance_encoded'] = df['observed_appearance'].map(appearance_map)

# Nominal Encoding: Create dummy variables (One-Hot)
df = pd.get_dummies(df, columns=['storage_location', 'cooling_method'])

print("--- Preprocessing Complete ---")

# --- 3. Define Features (X) and Target (y) ---

# Get the list of all dummy columns that were created
dummy_cols = [col for col in df.columns if 'storage_location_' in col or 'cooling_method_' in col]

# Define our final list of 9 features
feature_columns = [
    'hours_since_cooking',
    'initial_hours_at_room_temp',
    'smell_encoded',
    'appearance_encoded'
] + dummy_cols

X = df[feature_columns]
y = df['Spoilage_Index']

# --- 4. Split Data (Stratified) ---
# Stratify=y ensures train and test sets have the same class distribution
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"Data split: {len(X_train)} train samples, {len(X_test)} test samples.")


# =======================================================
# --- Model 1: Random Forest Classifier (No Scaling) ---
# =======================================================
print("\n--- Training Model 1: Random Forest ---")

# 1. Initialize
model_rf = RandomForestClassifier(random_state=42)

# 2. Train
model_rf.fit(X_train, y_train)

# 3. Predict
preds_rf = model_rf.predict(X_test)

# 4. Evaluate
print("--- Random Forest Results ---")
print(f"Accuracy: {accuracy_score(y_test, preds_rf)}")
print("\nClassification Report (Random Forest):")
print(classification_report(y_test, preds_rf, target_names=['0 (Fresh)', '1 (Stale)', '2 (Unsafe)', '3 (Spoiled)', '4 (Molded)']))


# ===================================================================
# --- Model 2: Logistic Regression (Requires Scaling) ---
# ===================================================================
print("\n--- Training Model 2: Logistic Regression ---")

# 1. Scale the data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("--- Data Scaled for Logistic Regression ---")

# 2. Initialize
model_lr = LogisticRegression(random_state=42, multi_class='ovr', max_iter=1000)

# 3. Train (on SCALED data)
model_lr.fit(X_train_scaled, y_train)

# 4. Predict (on SCALED data)
preds_lr = model_lr.predict(X_test_scaled)

# 5. Evaluate
print("--- Logistic Regression Results ---")
print(f"Accuracy: {accuracy_score(y_test, preds_lr)}")
print("\nClassification Report (Logistic Regression):")
print(classification_report(y_test, preds_lr, target_names=['0 (Fresh)', '1 (Stale)', '2 (Unsafe)', '3 (Spoiled)', '4 (Molded)']))

import joblib
import os

# --- 6. Save the Model and Scaler ---
print("\n--- Saving Model and Scaler ---")

# Define the directory to save files
output_dir = 'ML/rice' # As per your plan

# Create the directory if it doesn't exist
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Define file paths
model_path = os.path.join(output_dir, 'rice_model.joblib')
scaler_path = os.path.join(output_dir, 'rice_scaler.joblib')

# Save the Random Forest model (our best model)
joblib.dump(model_rf, model_path)
print(f"✅ Random Forest model saved to: {model_path}")

# Save the scaler (for our Logistic Regression model or future use)
# Note: The scaler was fit on X_train, which is correct.
joblib.dump(scaler, scaler_path)
print(f"✅ Scaler saved to: {scaler_path}")