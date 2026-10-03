# System Architecture: Cognitive Companion & ML Personalization Engine

## Overview
NeuroCare is a full-stack AI-powered cognitive companion and health management platform designed for elders, seniors, and caregivers. The system incorporates a closed-loop Machine Learning architecture that transforms gameplay telemetry and personal memory vault data into personalized cognitive training sessions.

---

## Closed-Loop ML Personalization Architecture

```
                         USER
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
      🧠 COGNITIVE GAMES        ❤️ MEMORY VAULT
              │                       │
              │                 User creates
              │                 photos/stories/
              │                 people/places
              │                       │
              ▼                       ▼
       PERFORMANCE DATA          MEMORY DATA
              │                       │
     ┌────────┼────────┐              │
     │        │        │              │
 Accuracy  Response  Mistakes     Memory Tags
 Recall    Time      Completion   People/Places
 Attention Hints                  Events/Stories
     │        │        │              │
     └────────┴────────┘              │
              │                       │
              ▼                       ▼
       FEATURE ENGINEERING      MEMORY PROCESSING
         Pandas + NumPy              │
              │                 ┌────┴─────┐
              │                 │          │
              │              Metadata   Embeddings*
              │                 │          │
              └──────────┬──────┴──────────┘
                         ▼
                 🧠 PERSONALIZATION
                      ENGINE
                 Python + ML
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   Difficulty      Activity         Memory-Based
   Prediction      Recommendation   Activities
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 PERSONALIZED SESSION
                         │
                         ▼
                  USER PLAYS AGAIN
                         │
                         └──────────→ LOOP
```

---

## Core ML Components & Data Pipeline

### 1. Dual Data Ingestion Streams
- **Stream A: Cognitive Games Performance Data**:
  - **Accuracy**: $A \in [0, 100]\%$ across 5 cognitive domains (Memory, Attention, Reasoning, Pattern, Language).
  - **Response Time / Latency**: Per-move and average response latencies measured in milliseconds ($T_{\text{latency}}$).
  - **Mistakes**: Error counts and consecutive error clustering ($E_{\text{burst}}$).
  - **Completion Rate & Recall**: Session completion ratio and short/long-term recall fidelity ($R_{\text{score}}$).
  - **Attention Focus Index**: Sustained visual/auditory discrimination metric ($I_{\text{attn}} \in [40, 100]$).
  - **Hints Used**: Reliance on scaffolding prompts ($H_{\text{used}}$).

- **Stream B: Memory Vault Data**:
  - **Memory Tags & Categories**: Categorized family facts, health routines, dietary preferences, and milestones.
  - **People & Places**: Relational entities (Granddaughter Riya, Son Amit) and regional North-East landmarks (Shillong, Kaziranga, Dibrugarh).
  - **Events & Stories**: Temporal occasions (Diwali 2024, Bihu Festival) with contextual memory hints and voice audio transcripts.

---

### 2. Feature Engineering Layer (Pandas + NumPy)
- **Exponentially Weighted Rolling Accuracy**:
  $$\bar{A}_{\text{rolling}} = \frac{\sum_{i=1}^n A_i \cdot 1.15^i}{\sum_{i=1}^n 1.15^i}$$
- **Latency Volatility**: Standard deviation of response times ($\sigma_T$).
- **Fatigue Decay Factor**:
  $$\text{Fatigue} = \min\left(0.85, \max\left(0.05, \frac{\bar{D}_{\text{recent}}}{120} \times 0.25 + \frac{E_{\text{recent}}}{10} \times 0.30\right)\right)$$
- **Error Burstiness**: Frequency of back-to-back mistakes in a session.
- **Sustained Attention Index**:
  $$I_{\text{sustained}} = \text{clip}\left(100 - (\text{Fatigue} \times 40) - (E_{\text{burst}} \times 30), 40, 100\right)$$

---

### 3. Memory Processing & Semantic Vector Embeddings
- **32-Dimensional Deterministic Semantic Embeddings**:
  $$\vec{v}_{\text{norm}} = \frac{\vec{v}}{\|\vec{v}\|_2}$$
- **Cosine Semantic Similarity**:
  $$\text{Sim}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2}$$
- **Familiarity & Emotional Valence Scoring**: Dynamically adjusts recall weight for high-positive family associations.

---

### 4. Personalization Engine (Python + ML Service & Native Engine)
- **Difficulty Prediction Model (Zone of Proximal Development Optimizer)**:
  $$\text{Load}_{\text{ZPD}} = 0.40 \cdot \frac{A}{100} + 0.25 \cdot \text{SpeedFactor} + 0.20 \cdot (1 - \text{MistakeRate}) + 0.15 \cdot (1 - \text{HintReliance}) - 0.15 \cdot \text{Fatigue}$$
  - $\text{Load}_{\text{ZPD}} \ge 0.82 \implies \textbf{HARD}$ (Tighter time limit, 16-card matrix, 4 distractors, 1.3x speed).
  - $0.58 \le \text{Load}_{\text{ZPD}} < 0.82 \implies \textbf{MEDIUM}$ (12-card matrix, 40s limit, 3 distractors, 1.0x speed).
  - $\text{Load}_{\text{ZPD}} < 0.58 \implies \textbf{EASY}$ (8-card matrix, 60s limit, 2 distractors, 0.8x speed, hints enabled).

- **Cognitive Activity Recommender**:
  $$\text{Score}(g) = 0.50 + 0.35 \cdot \mathbf{1}_{[\text{Domain}=\text{Weakest}]} + 0.25 \cdot \mathbf{1}_{[\text{MemoryPersonalized}]} + 0.20 \cdot \mathbf{1}_{[\text{AttentionGap}]} + 0.20 \cdot \mathbf{1}_{[\text{FatigueComfort}]}$$

- **Memory-Based Activity Generator**:
  - Dynamically synthesizes multiple-choice nostalgia trivia, photo recall challenges, and routine memory matching questions directly from the user's personal vault items.

- **Personalized Session Orchestrator**:
  - Curates structured 4-step playlists:
    1. *Step 1*: Personal Memory / Nostalgia Warmup
    2. *Step 2*: Primary Cognitive Gap Focus (at ZPD optimal difficulty)
    3. *Step 3*: Secondary Agility / Reasoning Challenge
    4. *Step 4*: Positive Reinforcement & Cool-down

---

## REST API Specification (`/api/ml/*`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/ml/telemetry` | Ingests real-time gameplay telemetry into the closed feedback loop |
| `GET` | `/api/ml/telemetry` | Retrieves historical telemetry records |
| `GET` | `/api/ml/features` | Returns computed Pandas/NumPy Cognitive Feature Matrix |
| `GET` | `/api/ml/predict-difficulty` | Predicts optimal ZPD difficulty for target domain |
| `GET` | `/api/ml/recommend-activities` | Returns ranked cognitive activity recommendations |
| `GET` | `/api/ml/memory-activities` | Returns synthesized personalized memory challenges |
| `POST` | `/api/ml/personalized-session` | Generates a complete tailored multi-game session playlist |
| `GET` | `/api/ml/dashboard` | Consolidated real-time ML pipeline analytics payload |
