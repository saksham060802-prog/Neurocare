# Cognitive Companion — AI-Powered Memory & Cognitive Assistant

Cognitive Companion is a full-stack web application designed to support seniors and individuals experiencing cognitive changes. It provides long-term personal memory retrieval, adaptive brain exercises, voice interaction, task reminders, and caregiver monitoring.

---

## Key Features

- 🧠 **Conversational AI Assistant**: Supportive, calm, and respectful conversational companion powered by `@google/genai` (Gemini 3.7 Flash).
- 📖 **RAG Long-Term Personal Memory Bank**: Automatically extracts personal facts (family connections, health preferences, daily routines) from chat and retrieves them semantically when asked.
- 🎯 **Adaptive Cognitive Exercises**: Brain exercises spanning Memory, Attention, Reasoning, Pattern Recognition, and Language with auto-calibrating difficulty (`EASY`, `MEDIUM`, `HARD`).
- ⏰ **Task & Reminder System**: Natural language reminder creation from chat or manual task creation for medication and daily routines.
- 🎤 **Voice Interaction**: Built-in voice input and speech synthesis via Web Speech API and Gemini text-to-speech.
- 🛡️ **Caregiver Portal**: Privacy-aware dashboard for family members and caregivers to monitor exercise scores and task completion without invading private conversation privacy.
- ♿ **Senior-Friendly Accessibility**: High-contrast mode, scalable text size, large touch targets (44px+), and clean non-cluttered layouts.

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Express (Node.js) on Port 3000
- **AI Engine**: `@google/genai` (`gemini-3.7-flash` & `gemini-embedding-2-preview`)
- **Database**: Local JSON persistence + Supabase PostgreSQL Migration schema (`supabase_schema.sql`)
- **Voice**: Web Speech API / Azure Speech SDK fallback

---

## Quick Start / Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` and set your API keys:
   ```bash
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

4. **Health Check Endpoint**:
   Visit `http://localhost:3000/health` to confirm server status.

---

## Build & Production

```bash
npm run build
npm run start
```

---

## Verification & Testing

- `npm run lint`: Verifies TypeScript compilation without errors.
- `GET /health`: Returns `{"status":"ok"}` with system readiness metadata.
