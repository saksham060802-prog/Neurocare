-- Cognitive Companion Supabase PostgreSQL Schema
-- Enable pgvector extension if available for semantic memory embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  age_range VARCHAR(50) DEFAULT '70-75',
  preferred_language VARCHAR(50) DEFAULT 'English',
  emergency_contact TEXT,
  notes TEXT,
  font_size VARCHAR(20) DEFAULT 'large',
  high_contrast BOOLEAN DEFAULT false,
  voice_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general', -- family, preference, medical, routine, milestone
  importance VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  source VARCHAR(50) DEFAULT 'chat', -- chat, manual
  tags TEXT[],
  embedding vector(768), -- Embedding vector column for pgvector
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memories_user_id_idx ON memories(user_id);
CREATE INDEX IF NOT EXISTS memories_category_idx ON memories(category);
CREATE INDEX IF NOT EXISTS memories_updated_at_idx ON memories(updated_at);

-- 3. Conversations / Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) DEFAULT 'usr_01',
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  memories_used JSONB,
  extracted_memory JSONB,
  extracted_task JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_history_user_idx ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS chat_history_timestamp_idx ON chat_history(timestamp);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed
  category VARCHAR(50) DEFAULT 'general', -- health, social, personal, general
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_status_idx ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS tasks_updated_at_idx ON tasks(updated_at);

-- 5. Cognitive Sessions Table
CREATE TABLE IF NOT EXISTS cognitive_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  activity_type VARCHAR(50) NOT NULL, -- memory, attention, reasoning, pattern, language
  difficulty VARCHAR(20) NOT NULL DEFAULT 'EASY', -- EASY, MEDIUM, HARD
  questions_count INT DEFAULT 1,
  correct_count INT DEFAULT 1,
  score INT NOT NULL, -- 0-100
  duration_seconds INT DEFAULT 30,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cognitive_sessions_user_idx ON cognitive_sessions(user_id);
CREATE INDEX IF NOT EXISTS cognitive_sessions_completed_at_idx ON cognitive_sessions(completed_at);

-- 6. Photo Memories Table
CREATE TABLE IF NOT EXISTS photo_memories (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  relation_tag VARCHAR(100) DEFAULT 'Family Member',
  location VARCHAR(255),
  date VARCHAR(100),
  context_hint TEXT,
  uploaded_by VARCHAR(50) DEFAULT 'caregiver',
  voice_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photo_memories_user_idx ON photo_memories(user_id);

-- 7. Game Performance Telemetry Table
CREATE TABLE IF NOT EXISTS game_telemetry (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  game_id VARCHAR(100) NOT NULL,
  game_title VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'EASY',
  accuracy NUMERIC DEFAULT 100,
  score NUMERIC DEFAULT 100,
  duration_seconds INT DEFAULT 60,
  response_times_ms JSONB,
  avg_response_time_ms NUMERIC DEFAULT 1500,
  mistakes_count INT DEFAULT 0,
  hints_used INT DEFAULT 0,
  completion_rate NUMERIC DEFAULT 100,
  recall_score NUMERIC DEFAULT 100,
  attention_focus_index NUMERIC DEFAULT 85,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS game_telemetry_user_domain_idx ON game_telemetry(user_id, domain);
CREATE INDEX IF NOT EXISTS game_telemetry_timestamp_idx ON game_telemetry(timestamp);

-- 8. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- missed_medication, cognitive_drop, inactivity, general
  severity VARCHAR(20) NOT NULL DEFAULT 'info', -- high, medium, info
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, dismissed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alerts_user_status_idx ON alerts(user_id, status);

-- 9. Call Logs Table
CREATE TABLE IF NOT EXISTS call_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(100) DEFAULT 'Caregiver',
  call_type VARCHAR(50) DEFAULT 'regular',
  status VARCHAR(50) DEFAULT 'answered',
  scheduled_time TIMESTAMPTZ DEFAULT NOW(),
  gps_coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Caregiver Connections Table
CREATE TABLE IF NOT EXISTS caregiver_connections (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  caregiver_id VARCHAR(255) NOT NULL,
  relationship VARCHAR(100) DEFAULT 'Family / Caregiver',
  permissions JSONB DEFAULT '{"viewProgress": true, "viewTasks": true, "viewAlerts": true, "viewMemories": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_connections ENABLE ROW LEVEL SECURITY;

-- Permissive Default Policies for App Operation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to profiles') THEN
    CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to memories') THEN
    CREATE POLICY "Allow all access to memories" ON memories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to chat_history') THEN
    CREATE POLICY "Allow all access to chat_history" ON chat_history FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to cognitive_sessions') THEN
    CREATE POLICY "Allow all access to cognitive_sessions" ON cognitive_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to tasks') THEN
    CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to photo_memories') THEN
    CREATE POLICY "Allow all access to photo_memories" ON photo_memories FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to game_telemetry') THEN
    CREATE POLICY "Allow all access to game_telemetry" ON game_telemetry FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to alerts') THEN
    CREATE POLICY "Allow all access to alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access to call_logs') THEN
    CREATE POLICY "Allow all access to call_logs" ON call_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
