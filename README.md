# meditrust
# 🏥 MediTrust

**MediTrust** is a **trust-first telemedicine platform** designed for Nigeria and emerging markets.  
Patients only pay if they are actually seen by a doctor, with **escrow-based payments, AI consultation verification, and counterfeit drug authenticity checks** built into the flow.

---

## ✨ Features
- 🤝 **Escrow Payments** – Patients’ payments are held until a consult is verified.  
- 🩺 **AI-Verified Consultations** – Calls are monitored to ensure patients are truly seen.  
- 💊 **Drug Authenticity Checker** – Verify prescriptions with QR/barcode scanning.  
- 📱 **Patient App** – Symptom intake, consult routing, and prescription checks.  
- 🧑‍⚕️ **Doctor Portal** – Manage consultations and track payouts.  
- 📊 **Admin Dashboard** – Handle disputes, payouts, and analytics.  
- 📡 **Low-Bandwidth Ready** – Audio-only calls, SMS/USSD fallback.  

---

## 🛠 Tech Stack
- **Frontend**: React Native (Expo), PWA (React/Vite)  
- **Backend**: Supabase (Postgres + RLS), Edge Functions, Redis (Upstash)  
- **Payments**: Paystack / Flutterwave (Escrow + Split Payouts)  
- **Video/Audio**: Daily.co / Twilio (WebRTC)  
- **AI Verification**: Deepgram / AssemblyAI (ASR, diarization, rules engine)  
- **Drug Auth**: QR/Barcode Scanner + Mock DB (Sproxil/mPedigree integration later)  
- **Notifications**: Africa’s Talking / Termii (SMS, USSD), SendGrid (email)  
- **Infra & Monitoring**: Vercel, Sentry, Grafana  

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18)  
- Supabase CLI  
- Paystack/Flutterwave test accounts  
- Daily.co/Twilio API key  

### Setup
```bash
# clone repo
git clone https://github.com/your-org/meditrust.git
cd meditrust

# install dependencies
npm install

# run frontend
npm run dev
