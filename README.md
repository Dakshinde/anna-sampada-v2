# Anna Sampada: An AI-Powered Food Waste Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

An intelligent web application that uses a hybrid AI system—combining specialized Machine Learning models with a Generative AI chatbot—to help users predict food spoilage, get recipes from leftovers, and donate surplus food.

### **Live Demo: [anna-sampada-v1.vercel.app](https://anna-sampada-v1.vercel.app/)** *(Replace with your Vercel link)*

---

## 🚀 Core Features

* **Multi-Model Spoilage Prediction:** Uses **5 unique ML models** (for Rice, Milk, Paneer, Roti, and Dal) to provide accurate freshness predictions based on user inputs.
* **"Anna" AI Chatbot:** An intelligent assistant powered by the Google Gemini API. It can:
    * **Generate Recipes:** Creates recipes from a list of user's leftover ingredients.
    * **Provide Safety Tips:** Answers contextual questions about food safety.
    * **App Navigation:** Acts as a smart guide, navigating users to app features like "Predict Spoilage" or "Find NGOs".
    * **Understand Dietary Modes:** Adheres to `Veg`, `Non-Veg`, and `Jain` dietary constraints.
* **User Authentication & Roles:** A complete user management system with three distinct roles:
    * **User:** Can predict spoilage, chat with the AI, and donate food.
    * **NGO:** Can receive donation notifications.
    * **Composter:** Can be listed as a waste management option.
* **NGO Donation Portal:** A complete end-to-end feature that:
    1.  Allows users to find nearby NGOs (using a demo list, formerly Google Maps).
    2.  Lets users fill out a "Donation Form" with food details.
    3.  Sends an **automated email notification** from the backend (`app.py`) to the NGO.
* **AI Training & Data Logging:**
    * All user predictions and chatbot conversations are **logged to a Firestore database**.
    * This creates an invaluable dataset for debugging, personalization ("Chat Memory"), and future fine-tuning of the AI models.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, React Router, Tailwind CSS, Framer Motion, Material-UI, Lucide React |
| **Backend** | Python (Flask), Gunicorn |
| **AI (Chatbot)** | Google Gemini Pro API |
| **AI (Prediction)**| Scikit-learn, Pandas, XGBoost |
| **Database** | Google Firestore (for Users, Predictions, and Chat Logs) |
| **Deployment** | Vercel |

---

## 📁 Project Architecture

This project is a monorepo containing a separate frontend and backend, configured to deploy as a single application on Vercel.

```
/annasampada-v1.1/
│
├── backend/
│   ├── ML/
│   │   ├── rice/ (rice_model.joblib)
│   │   ├── milk/ (xgboost_milk_spoilage_model.joblib)
│   │   ├── paneer/ (random_forest_paneer_model.joblib)
│   │   ├── roti/ (roti_spoiler_pipeline.joblib)
│   │   └── dal/ (dal_spoilage_final_model.joblib)
│   │
│   ├── app.py            # Main Flask Server (all API routes)
│   ├── requirements.txt  # Python dependencies for Vercel
│   ├── serviceAccountKey.json (IGNORED - Firebase Admin Key)
│   └── .env              (IGNORED - All API Keys)
│
├── frontend/ (This is the root for the React app)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/ (ProtectedRoute.jsx)
│   │   │   ├── chatbot/ (ChatbotWidget.jsx)
│   │   │   ├── layout/ (Navbar.jsx, Footer.jsx)
│   │   │   └── ui/ (ChatMenu.jsx, ChatMessage.jsx, etc.)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useChatSession.js
│   │   ├── pages/
│   │   │   ├── auth/ (LoginPage.jsx, SignupPage.jsx)
│   │   │   ├── user/ (UserDashboard.jsx, UserHomePage.jsx, etc.)
│   │   │   └── UnderConstruction.jsx
│   │   ├── services/
│   │   │   └── chatbot.service.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env              (IGNORED - Frontend API Keys)
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore            # Ignores all node_modules and .env files
└── vercel.json           # Vercel deployment configuration
```

---

## ⚙️ Setup & Deployment

Note: Hosted on Render Free Tier; please allow 30 seconds for the initial 'Cold Start' wake-up." This shows you understand cloud infrastructure limitations.

This project is built to be deployed on **Vercel**.

### 1. Prerequisites
* A **Google Cloud Project** with:
    1.  **Firestore** database enabled.
    2.  **Gemini API** (`Vertex AI Generative AI API`) enabled.
    3.  A `serviceAccountKey.json` file downloaded.
    4.  A `GEMINI_API_KEY`.
* A **Google Mail account** with an "App Password" (for `EMAIL_APP_PASSWORD`).

### 2. Local Development

**Backend:**
```bash
# 1. Go into the backend folder
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create a .env file and add your secret keys
#    GEMINI_API_KEY="your_key"
#    EMAIL_SENDER="your-bot@gmail.com"
#    EMAIL_APP_PASSWORD="your-16-digit-app-password"

# 5. Add your 'serviceAccountKey.json' file

# 6. Run the server
python app.py
```

**Frontend:**
```bash
# 1. Go to the project root folder
cd .. 

# 2. Install frontend dependencies
npm install

# 3. Run the development server
npm run dev
```

### 3. Vercel Deployment
1.  **Push to GitHub:** Push your final, clean project to your GitHub repository.
2.  **Import to Vercel:** On the Vercel dashboard, import your GitHub repository.
3.  **Configure Project:**
    * Vercel will detect this is a monorepo. It will find the `frontend` and `backend` folders using the `vercel.json` file.
    * **Framework Preset:** Select `Vite`.
    * **Root Directory:** Leave this as the default (the root of your project).
4.  **Add Environment Variables:**
    * In your Vercel project's **Settings** > **Environment Variables**, add all the keys from your `backend/.env` file:
    * `GEMINI_API_KEY`
    * `EMAIL_SENDER`
    * `EMAIL_APP_PASSWORD`
5.  **Click "Deploy"**.

---

## 🏆 What We Accomplished

* **Fixed All Bugs:**
    * Fixed `node_modules` and secret keys being tracked by Git.
    * Fixed all `404` routing errors between the frontend and backend.
    * Fixed all `CORS` issues.
    * Fixed all React `ReferenceError` and `Key` bugs.
* **Built a Professional UI/UX:**
    * Designed a clean, professional User Dashboard.
    * Built a smart, multi-step chatbot with a UI that matches the app.
    * Added a "Protected Route" to hide the dashboard from logged-out users.
* **Shipped a Complete, End-to-End Product:**
    * We didn't just build a "demo." We built a platform with full **Authentication**, **Machine Learning**, **Generative AI**, and **Database Logging**. This is a complete, production-ready system.