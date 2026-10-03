import fs from 'fs';
import path from 'path';
import {
  UserProfile,
  Memory,
  ChatMessage,
  Task,
  CognitiveSession,
  Alert,
  ProgressMetrics,
  CaregiverOverview,
} from '../src/types';

export interface SyncOperation {
  id: string;
  table: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface PhotoMemory {
  id: string;
  userId: string;
  photoUrl: string;
  title: string;
  relationTag?: string;
  location?: string;
  date?: string;
  contextHint?: string;
  uploadedBy?: string;
  voiceNote?: string;
  createdAt: string;
}

export interface GeofenceState {
  radiusMeters: number;
  centerLat: number;
  centerLng: number;
  locationName: string;
  controlledBy: string;
  locations: Record<string, any>;
}

interface DatabaseSchema {
  profile: UserProfile;
  memories: Memory[];
  chatHistory: ChatMessage[];
  tasks: Task[];
  cognitiveSessions: CognitiveSession[];
  alerts: Alert[];
  photoMemories?: PhotoMemory[];
  geofenceState?: GeofenceState;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultProfile: UserProfile = {
  id: 'usr_01',
  userId: 'usr_01',
  name: 'Margaret Vance',
  ageRange: '70-75',
  preferredLanguage: 'English',
  emergencyContact: 'Priya Vance (Daughter) - (555) 234-5678',
  notes: 'Prefers gentle morning activities and calm conversational tone.',
  fontSize: 'large',
  highContrast: false,
  voiceEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultMemories: Memory[] = [
  {
    id: 'mem_1',
    userId: 'usr_01',
    content: "My daughter's name is Priya.",
    category: 'family',
    importance: 'high',
    source: 'manual',
    tags: ['family', 'daughter', 'priya'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mem_2',
    userId: 'usr_01',
    content: 'My favorite drink is warm chamomile tea with honey.',
    category: 'preference',
    importance: 'medium',
    source: 'manual',
    tags: ['preference', 'tea', 'drink'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'mem_3',
    userId: 'usr_01',
    content: 'I take my blood pressure medication every morning at 8:00 AM.',
    category: 'medical',
    importance: 'high',
    source: 'manual',
    tags: ['medical', 'blood pressure', 'medication'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'mem_4',
    userId: 'usr_01',
    content: 'I enjoy taking a 20-minute morning walk in the garden around 9:00 AM.',
    category: 'routine',
    importance: 'medium',
    source: 'manual',
    tags: ['routine', 'walk', 'garden'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const defaultTasks: Task[] = [
  {
    id: 'tsk_1',
    userId: 'usr_01',
    title: 'Take morning blood pressure medication',
    description: '1 tablet with a full glass of water.',
    dueAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: 'pending',
    category: 'health',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_2',
    userId: 'usr_01',
    title: 'Call Priya to check on weekend lunch plans',
    description: "Discuss Sunday family gathering at Priya's place.",
    dueAt: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: 'pending',
    category: 'social',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tsk_3',
    userId: 'usr_01',
    title: 'Complete 10-minute morning memory exercise',
    description: 'Daily cognitive training session.',
    dueAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'completed',
    category: 'personal',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
  },
];

const defaultSessions: CognitiveSession[] = [
  {
    id: 'ses_1',
    userId: 'usr_01',
    activityType: 'memory',
    difficulty: 'EASY',
    questionsCount: 3,
    correctCount: 3,
    score: 100,
    durationSeconds: 110,
    completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ses_2',
    userId: 'usr_01',
    activityType: 'attention',
    difficulty: 'EASY',
    questionsCount: 4,
    correctCount: 3,
    score: 75,
    durationSeconds: 140,
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ses_3',
    userId: 'usr_01',
    activityType: 'reasoning',
    difficulty: 'MEDIUM',
    questionsCount: 4,
    correctCount: 4,
    score: 100,
    durationSeconds: 180,
    completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const defaultAlerts: Alert[] = [
  {
    id: 'alt_1',
    userId: 'usr_01',
    type: 'general',
    severity: 'info',
    message: 'Margaret completed a cognitive memory session with a 100% score!',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const seenIds = new Set<string>();
        const chatHistory: ChatMessage[] = (parsed.chatHistory || []).map((msg: ChatMessage, idx: number) => {
          let id = msg.id;
          if (!id || seenIds.has(id)) {
            id = `msg_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
          }
          seenIds.add(id);
          return { ...msg, id };
        });

        return {
          profile: parsed.profile || defaultProfile,
          memories: parsed.memories || defaultMemories,
          chatHistory,
          tasks: parsed.tasks || defaultTasks,
          cognitiveSessions: parsed.cognitiveSessions || defaultSessions,
          alerts: parsed.alerts || defaultAlerts,
        };
      }
    } catch (e) {
      console.error('Error reading DB file, using default schema:', e);
    }

    const initial = {
      profile: defaultProfile,
      memories: defaultMemories,
      chatHistory: [],
      tasks: defaultTasks,
      cognitiveSessions: defaultSessions,
      alerts: defaultAlerts,
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving DB file:', e);
    }
  }

  public getProfile(): UserProfile {
    return this.db.profile;
  }

  public updateProfile(updated: Partial<UserProfile>): UserProfile {
    this.db.profile = {
      ...this.db.profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.db);
    return this.db.profile;
  }

  public getMemories(searchQuery?: string, category?: string): Memory[] {
    let list = this.db.memories;
    if (category && category !== 'all') {
      list = list.filter((m) => m.category === category);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.content.toLowerCase().includes(query) ||
          m.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addMemory(
    content: string,
    category: Memory['category'] = 'general',
    importance: Memory['importance'] = 'medium',
    source: 'chat' | 'manual' = 'manual',
    tags: string[] = []
  ): Memory {
    // Avoid duplicate memory content
    const existing = this.db.memories.find(
      (m) => m.content.trim().toLowerCase() === content.trim().toLowerCase()
    );
    if (existing) return existing;

    const newMem: Memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: this.db.profile.userId,
      content: content.trim(),
      category,
      importance,
      source,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.memories.unshift(newMem);
    this.saveData(this.db);
    return newMem;
  }

  public updateMemory(id: string, updates: Partial<Memory>): Memory | null {
    const idx = this.db.memories.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    this.db.memories[idx] = {
      ...this.db.memories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.db);
    return this.db.memories[idx];
  }

  public deleteMemory(id: string): boolean {
    const initialLen = this.db.memories.length;
    this.db.memories = this.db.memories.filter((m) => m.id !== id);
    const deleted = this.db.memories.length < initialLen;
    if (deleted) this.saveData(this.db);
    return deleted;
  }

  public getChatHistory(): ChatMessage[] {
    return this.db.chatHistory;
  }

  public addChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.db.chatHistory.push(newMessage);
    this.saveData(this.db);
    return newMessage;
  }

  public clearChatHistory(): void {
    this.db.chatHistory = [];
    this.saveData(this.db);
  }

  public getTasks(status?: 'pending' | 'completed'): Task[] {
    let list = this.db.tasks;
    if (status) {
      list = list.filter((t) => t.status === status);
    }
    return list.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  }

  public addTask(title: string, description?: string, dueAt?: string, category: Task['category'] = 'general'): Task {
    const newTask: Task = {
      id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.db.profile.userId,
      title,
      description: description || '',
      dueAt: dueAt || new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      category,
      createdAt: new Date().toISOString(),
    };

    this.db.tasks.unshift(newTask);
    this.saveData(this.db);
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    if (updates.status === 'completed' && this.db.tasks[idx].status !== 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    this.db.tasks[idx] = {
      ...this.db.tasks[idx],
      ...updates,
    };
    this.saveData(this.db);
    return this.db.tasks[idx];
  }

  public deleteTask(id: string): boolean {
    const initialLen = this.db.tasks.length;
    this.db.tasks = this.db.tasks.filter((t) => t.id !== id);
    const deleted = this.db.tasks.length < initialLen;
    if (deleted) this.saveData(this.db);
    return deleted;
  }

  public addCognitiveSession(session: Omit<CognitiveSession, 'id' | 'userId' | 'completedAt'>): CognitiveSession {
    const newSession: CognitiveSession = {
      ...session,
      id: `ses_${Date.now()}`,
      userId: this.db.profile.userId,
      completedAt: new Date().toISOString(),
    };
    this.db.cognitiveSessions.unshift(newSession);

    // Auto-create alert if score is low or milestone high
    if (newSession.score >= 90) {
      this.addAlert({
        type: 'general',
        severity: 'info',
        message: `Margaret scored ${newSession.score}% on ${newSession.activityType} cognitive exercise (${newSession.difficulty}).`,
      });
    } else if (newSession.score < 50) {
      this.addAlert({
        type: 'cognitive_drop',
        severity: 'medium',
        message: `Margaret scored ${newSession.score}% on ${newSession.activityType} exercise (${newSession.difficulty}). Difficulty adjusted automatically.`,
      });
    }

    this.saveData(this.db);
    return newSession;
  }

  public getCognitiveSessions(): CognitiveSession[] {
    return this.db.cognitiveSessions;
  }

  public getProgressMetrics(): ProgressMetrics {
    const sessions = this.db.cognitiveSessions;

    const calcCategoryAvg = (type: string) => {
      const typeSessions = sessions.filter((s) => s.activityType === type);
      if (typeSessions.length === 0) return 80;
      const sum = typeSessions.reduce((acc, s) => acc + s.score, 0);
      return Math.round(sum / typeSessions.length);
    };

    const memoryScore = calcCategoryAvg('memory');
    const attentionScore = calcCategoryAvg('attention');
    const reasoningScore = calcCategoryAvg('reasoning');
    const languageScore = calcCategoryAvg('language');
    const overallScore = Math.round((memoryScore + attentionScore + reasoningScore + languageScore) / 4);

    // Determine current level based on recent session scores
    const recentScores = sessions.slice(0, 5).map((s) => s.score);
    const avgRecent = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 80;
    let currentLevel: ProgressMetrics['currentLevel'] = 'EASY';
    if (avgRecent >= 85) currentLevel = 'HARD';
    else if (avgRecent >= 65) currentLevel = 'MEDIUM';

    // Mock weekly trend
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrend = days.map((day, idx) => ({
      day,
      score: Math.min(100, Math.max(60, overallScore + (idx % 3 === 0 ? 5 : idx % 2 === 0 ? -4 : 2))),
    }));

    return {
      memoryScore,
      attentionScore,
      reasoningScore,
      languageScore,
      overallScore,
      currentLevel,
      streakDays: 4,
      totalSessionsCompleted: sessions.length,
      weeklyTrend,
    };
  }

  public getAlerts(): Alert[] {
    return this.db.alerts;
  }

  public addAlert(alert: Omit<Alert, 'id' | 'userId' | 'status' | 'createdAt'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: this.db.profile.userId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    this.db.alerts.unshift(newAlert);
    this.saveData(this.db);
    return newAlert;
  }

  public dismissAlert(id: string): boolean {
    const alert = this.db.alerts.find((a) => a.id === id);
    if (alert) {
      alert.status = 'dismissed';
      this.saveData(this.db);
      return true;
    }
    return false;
  }

  public getCaregiverOverview(): CaregiverOverview {
    const pendingTasks = this.getTasks('pending');
    const completedTasks = this.getTasks('completed');

    return {
      patientProfile: this.getProfile(),
      metrics: this.getProgressMetrics(),
      recentSessions: this.getCognitiveSessions().slice(0, 5),
      pendingTasks,
      completedTasksCount: completedTasks.length,
      totalTasksCount: pendingTasks.length + completedTasks.length,
      alerts: this.getAlerts().filter((a) => a.status === 'active'),
      lastActive: new Date().toISOString(),
    };
  }

  // Offline Sync
  public async pullSyncData(since?: string) {
    return {
      profile: this.getProfile(),
      memories: this.getMemories(),
      tasks: this.getTasks(),
      cognitiveSessions: this.getCognitiveSessions(),
      alerts: this.getAlerts(),
      timestamp: new Date().toISOString(),
    };
  }

  public async processSyncPush(operations: SyncOperation[]) {
    let processed = 0;
    let errors = 0;
    for (const op of operations) {
      try {
        processed++;
      } catch {
        errors++;
      }
    }
    return { processed, errors };
  }

  // Photo Memories
  public getPhotoMemories(): PhotoMemory[] {
    return this.db.photoMemories || [];
  }

  public async addPhotoMemory(photo: Omit<PhotoMemory, 'id' | 'createdAt'>): Promise<PhotoMemory> {
    if (!this.db.photoMemories) {
      this.db.photoMemories = [];
    }
    const newPhoto: PhotoMemory = {
      ...photo,
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.db.photoMemories.unshift(newPhoto);
    this.saveData(this.db);
    return newPhoto;
  }

  public async deletePhotoMemory(id: string): Promise<boolean> {
    if (!this.db.photoMemories) return false;
    const idx = this.db.photoMemories.findIndex((p: PhotoMemory) => p.id === id);
    if (idx !== -1) {
      this.db.photoMemories.splice(idx, 1);
      this.saveData(this.db);
      return true;
    }
    return false;
  }

  // Geofence
  public getGeofenceState(): GeofenceState {
    if (!this.db.geofenceState) {
      this.db.geofenceState = {
        radiusMeters: 500,
        centerLat: 37.7749,
        centerLng: -122.4194,
        locationName: 'Home Residence',
        controlledBy: 'Caregiver',
        locations: {},
      };
    }
    return this.db.geofenceState;
  }

  public updateGeofenceRadius(radiusMeters: number, controlledBy?: string): GeofenceState {
    const state = this.getGeofenceState();
    state.radiusMeters = radiusMeters;
    if (controlledBy) state.controlledBy = controlledBy;
    this.saveData(this.db);
    return state;
  }

  public updateGeofenceCenter(centerLat: number, centerLng: number, locationName?: string): GeofenceState {
    const state = this.getGeofenceState();
    state.centerLat = centerLat;
    state.centerLng = centerLng;
    if (locationName) state.locationName = locationName;
    this.saveData(this.db);
    return state;
  }

  public updateUserLocation(data: { userId: string; userName?: string; role?: string; lat: number; lng: number; accuracyMeters?: number; speedKmh?: number; headingDeg?: number; batteryPercent?: number }): GeofenceState {
    const state = this.getGeofenceState();
    if (!state.locations) state.locations = {};
    state.locations[data.userId] = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData(this.db);
    return state;
  }
}

export const dbService = new DatabaseService();
