# Project Status: Cognitive Companion

## Overview
Cognitive Companion is a full-stack AI-powered personal companion and cognitive assistant designed to provide long-term memory retrieval, adaptive cognitive training exercises, voice interaction, task/reminder management, and caregiver progress insights.

## Acceptance Criteria Checklist

- [x] Frontend starts successfully
- [x] Backend starts successfully
- [x] `/health` returns `{"status":"ok"}`
- [x] Frontend communicates with Express backend API
- [x] Persistent JSON storage + Supabase PostgreSQL schema provided (`supabase_schema.sql`)
- [x] User/profile functionality works
- [x] AI chat works with Gemini 3.7 Flash (`@google/genai`)
- [x] Graceful fallback exists when Gemini key is missing
- [x] Long-term memory storage works
- [x] Semantic memory retrieval (RAG) works
- [x] Cognitive training works across 5 activity domains
- [x] Adaptive difficulty adjustment works (`EASY`, `MEDIUM`, `HARD`)
- [x] Cognitive exercise scores are persisted to database
- [x] Tasks can be created via chat or manual form
- [x] Tasks can be completed and deleted
- [x] Voice input & output work via Web Speech API & Gemini TTS
- [x] Text mode works seamlessly without microphone
- [x] Progress dashboard uses real database data
- [x] Mobile layout works (tested 360px - 1440px+)
- [x] Desktop layout works
- [x] Error states handled gracefully
- [x] No secrets are hardcoded
- [x] No privileged credentials exposed to client
- [x] README.md updated
- [x] DEMO_SCRIPT.md created
- [x] REPO_USAGE.md created
- [x] ARCHITECTURE.md created
- [x] Production build succeeds (`compile_applet`)
