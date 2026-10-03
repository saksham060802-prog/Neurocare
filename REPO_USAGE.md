# Reference Repository Usage & License Audit

The following reference repositories were inspected for architectural patterns, cognitive exercise designs, memory RAG flows, and UI concepts. All implementations in this codebase are independently developed clean-room implementations using TypeScript, Express, React, and `@google/genai`.

| Repository | License | Key Concepts Reviewed | Implementation Status | Code Direct Copy |
|---|---|---|---|---|
| **microsoft/ReMe** | MIT | Adaptive cognitive training sessions, difficulty tracking | Implemented adaptive scoring and difficulty progression in `server.ts` & `CognitiveTraining.tsx` | No |
| **Azure-Samples/cognitive-services-speech-sdk** | MIT | Speech-to-text, text-to-speech error handling & fallbacks | Implemented Web Speech API + Gemini TTS & Azure REST API support in `voice.ts` | No |
| **mahak-modani/ai-dementia-memory-aid** | MIT | Memory aid, reminders, person/context recognition concepts | Implemented memory tagging (family, preference, medical, routine) in memory engine | No |
| **SilverMind-Project/cognitive-companion** | AGPL-3.0 | Safety concepts, caregiver workflow, senior-friendly UX | Inspired caregiver dashboard & safety disclaimers (independent implementation, zero AGPL code copied) | No |
| **AFEEFAMT/memory-companion** | MIT | Long-term memory extraction and conversational recall | Implemented RAG memory extraction & cosine similarity retrieval | No |
| **BadrinathanTV/OpenVoice-AI** | MIT | Voice architecture and audio streaming | Implemented browser Web Speech API & voice control loop | No |
| **livekit-examples/supabase-hacker-starter** | Apache-2.0 | Session persistence & agent memory concepts | Implemented persistent database storage and memory context injection | No |
| **zijinz456/OpenTutor** | MIT | Adaptive learning & spaced difficulty adjustment | Implemented performance ratio difficulty scaling (Easy / Medium / Hard) | No |
