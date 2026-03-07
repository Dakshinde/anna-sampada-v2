import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
import joblib # Import joblib for saving
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

# --- Re-run Data Loading, Splitting, and Scaling ---
# (Necessary to have the fitted scaler and model in memory)
try:
    df = pd.read_csv('milk_spoilage_preprocessed.csv')
except FileNotFoundError:
    print("Error: 'milk_spoilage_preprocessed.csv' not found.")
    exit()

X = df.drop('Spoilage_Index', axis=1)
y = df['Spoilage_Index']

# Split just enough to get the training set to fit the scaler and model
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.4, random_state=42, stratify=y
)
# We don't strictly need val/test sets just for saving the model trained on X_train

numerical_cols = ['days_since_open_or_purchase', 'cumulative_hours_at_room_temp',
                  'observed_smell', 'observed_consistency']

# Fit the scaler
scaler = StandardScaler()
scaler.fit(X_train[numerical_cols])
X_train[numerical_cols] = scaler.transform(X_train[numerical_cols])
# Apply scaling to X_temp as well if needed later, but not strictly needed for saving

# --- Train the final XGBoost model on the FULL Training set ---
print("Training the final XGBoost model...")
xgb_model = XGBClassifier(random_state=42, objective='multi:softmax', num_class=3, use_label_encoder=False, eval_metric='mlogloss')
xgb_model.fit(X_train, y_train)
print("Model training complete.")

# --- Save the Model and the Scaler ---
model_filename = 'xgboost_milk_spoilage_model.joblib'
scaler_filename = 'scaler_milk_spoilage.joblib'

print(f"Saving model to {model_filename}...")
joblib.dump(xgb_model, model_filename)
print("Model saved.")

print(f"Saving scaler to {scaler_filename}...")
joblib.dump(scaler, scaler_filename)
print("Scaler saved.")

print("\nModel and scaler have been saved successfully.")