export type MemoryCategory = 'family' | 'preference' | 'medical' | 'routine' | 'milestone' | 'general';
export type MemoryImportance = 'high' | 'medium' | 'low';

export interface Memory {
  id: string;
  userId: string;
  content: string;
  category: MemoryCategory;
  importance: MemoryImportance;
  source: 'chat' | 'manual';
  tags?: string[];
  embedding?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  ageRange: string;
  preferredLanguage: string;
  emergencyContact?: string;
  notes?: string;
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  memoriesUsed?: { id: string; content: string }[];
  intent?: string;
  extractedMemory?: { content: string; category: MemoryCategory };
  extractedTask?: { title: string; dueAt?: string };
}

export type CognitiveActivityType = 'memory' | 'attention' | 'reasoning' | 'pattern' | 'language';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface CognitiveQuestion {
  id: string;
  activityType: CognitiveActivityType;
  difficulty: DifficultyLevel;
  question: string;
  options?: string[];
  expectedAnswer: string;
  hint?: string;
  contextInfo?: string;
}

export interface CognitiveSession {
  id: string;
  userId: string;
  activityType: CognitiveActivityType;
  difficulty: DifficultyLevel;
  questionsCount: number;
  correctCount: number;
  score: number; // 0 - 100
  durationSeconds: number;
  completedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueAt: string;
  status: 'pending' | 'completed';
  category?: 'health' | 'social' | 'personal' | 'general';
  createdAt: string;
  completedAt?: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'missed_medication' | 'cognitive_drop' | 'inactivity' | 'general';
  severity: 'high' | 'medium' | 'info';
  message: string;
  status: 'active' | 'dismissed';
  createdAt: string;
}

export interface ProgressMetrics {
  memoryScore: number;
  attentionScore: number;
  reasoningScore: number;
  languageScore: number;
  overallScore: number;
  currentLevel: DifficultyLevel;
  streakDays: number;
  totalSessionsCompleted: number;
  weeklyTrend: { day: string; score: number }[];
}

export interface CaregiverOverview {
  patientProfile: UserProfile;
  metrics: ProgressMetrics;
  recentSessions: CognitiveSession[];
  pendingTasks: Task[];
  completedTasksCount: number;
  totalTasksCount: number;
  alerts: Alert[];
  lastActive: string;
}

export interface PhotoMemory {
  id: string;
  userId: string;
  photoUrl: string;
  title: string;
  relationTag: string; // e.g., "Granddaughter Riya in Shillong"
  location?: string; // e.g., "Shillong, Meghalaya"
  date?: string; // e.g., "October 2023"
  contextHint?: string; // e.g., "She visited last Diwali with yellow flowers"
  uploadedBy: 'elder' | 'caregiver';
  voiceNote?: string;
  createdAt: string;
}

export interface MriScanReport {
  id: string;
  patientId: string;
  patientName: string;
  scanDate: string;
  mriImageUrl: string;
  predictedStage: 'Normal' | 'Mild' | 'Moderate' | 'Severe';
  confidence: number; // e.g. 94.2
  hippocampalAtrophy: number; // e.g. 18.5 %
  ventricularEnlargement: number; // e.g. 14.2 %
  doctorVerifiedStage?: 'Normal' | 'Mild' | 'Moderate' | 'Severe';
  doctorNotes?: string;
  assignedGames?: string[];
  status: 'pending_review' | 'verified';
}

export interface CallLog {
  id: string;
  userId: string;
  callerName: string;
  callerRole: 'Caregiver' | 'Doctor' | 'AI Voice Companion';
  callType: 'medication' | 'routine_walk' | 'cognitive_checkin' | 'emergency';
  status: 'answered' | 'missed' | 'declined';
  scheduledTime: string;
  gpsCoordinates: {
    lat: number;
    lng: number;
    locationName: string;
  };
}

export interface GeofenceZone {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  locationName: string;
  currentLat: number;
  currentLng: number;
  isWandering: boolean;
  lastUpdated: string;
}

