import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutUser,
  db,
  testFirestoreConnection,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { GoogleContact } from './services/GoogleContactsService';
import { Navbar } from './components/Navbar';
import { ResponsiveLayout } from './components/ResponsiveLayout';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { CognitiveView } from './components/CognitiveView';
import { MemoryView } from './components/MemoryView';
import { TaskView } from './components/TaskView';
import { ProgressView } from './components/ProgressView';
import { CaregiverDashboardTabs } from './components/CaregiverDashboardTabs';
import { DoctorPortal } from './components/DoctorPortal';
import { IncomingCallModal } from './components/IncomingCallModal';
import { SettingsView } from './components/SettingsView';
import { LanguageModal } from './components/LanguageModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LanguageOption } from './i18n/translations';
import {
  UserProfile,
  Memory,
  ChatMessage,
  Task,
  CognitiveSession,
  ProgressMetrics,
  CaregiverOverview,
  PhotoMemory,
  CallLog,
} from './types';

function AppContent() {
  const { currentLanguage, languageCode, setLanguage, isModalOpen, closeModal, openLanguageModal } = useLanguage();

  const [activeTab, setActiveTab] = useState('home');
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  // Firebase & Google Workspace Auth State
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initial Default States
  const defaultProfile: UserProfile = {
    id: 'p1',
    userId: 'p1',
    name: 'Ramesh Sharma',
    ageRange: '70-75',
    preferredLanguage: 'Hindi',
    emergencyContact: 'Caregiver Priya (+91 98765 43210)',
    notes: 'Enjoys morning walks and classical music in Shillong.',
    fontSize: 'large',
    highContrast: false,
    voiceEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultMetrics: ProgressMetrics = {
    memoryScore: 82,
    attentionScore: 78,
    reasoningScore: 85,
    languageScore: 88,
    overallScore: 83,
    currentLevel: 'MEDIUM',
    streakDays: 5,
    totalSessionsCompleted: 14,
    weeklyTrend: [
      { day: 'Mon', score: 75 },
      { day: 'Tue', score: 78 },
      { day: 'Wed', score: 80 },
      { day: 'Thu', score: 82 },
      { day: 'Fri', score: 85 },
      { day: 'Sat', score: 83 },
      { day: 'Sun', score: 86 },
    ],
  };

  const defaultCaregiverOverview: CaregiverOverview = {
    patientProfile: defaultProfile,
    metrics: defaultMetrics,
    recentSessions: [],
    pendingTasks: [],
    completedTasksCount: 3,
    totalTasksCount: 5,
    alerts: [],
    lastActive: 'Just now',
  };

  // Application Data States
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<CognitiveSession[]>([]);
  const [metrics, setMetrics] = useState<ProgressMetrics>(defaultMetrics);
  const [caregiverOverview, setCaregiverOverview] = useState<CaregiverOverview>(defaultCaregiverOverview);
  const [healthInfo, setHealthInfo] = useState({ geminiConfigured: false, azureConfigured: false });
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // New SIH 2026 Feature States
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState(false);
  const [isDoctorPortalActive, setIsDoctorPortalActive] = useState(false);

  const [photoMemories, setPhotoMemories] = useState<PhotoMemory[]>([
    {
      id: 'p_1',
      userId: 'p1',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      title: 'Granddaughter Riya in Shillong',
      relationTag: 'Granddaughter Riya',
      location: 'Shillong, Meghalaya',
      date: 'Diwali 2024',
      contextHint: 'Riya wore her yellow dress and brought marigold flowers.',
      uploadedBy: 'caregiver',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p_2',
      userId: 'p1',
      photoUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      title: 'Family Trip to Kaziranga National Park',
      relationTag: 'Kaziranga National Park',
      location: 'Kaziranga, Assam',
      date: 'November 2023',
      contextHint: 'We rode on elephant safari in the early morning fog.',
      uploadedBy: 'caregiver',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [callLogs, setCallLogs] = useState<CallLog[]>([
    {
      id: 'log_1',
      userId: 'p1',
      callerName: 'Dr. Sen (NeuroCare)',
      callerRole: 'Doctor',
      callType: 'medication',
      status: 'answered',
      scheduledTime: new Date(Date.now() - 3600000).toISOString(),
      gpsCoordinates: {
        lat: 25.5788,
        lng: 91.8933,
        locationName: 'Shillong, Meghalaya',
      },
    },
  ]);

  // Load initial data from backend API
  const loadData = async () => {
    try {
      const [pRes, mRes, tRes, cRes, sRes, prRes, cgRes, hRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/memories'),
        fetch('/api/tasks'),
        fetch('/api/chat/history'),
        fetch('/api/cognitive/history'),
        fetch('/api/progress'),
        fetch('/api/caregiver/overview'),
        fetch('/api/health'),
      ]);

      if (pRes.ok) setProfile(await pRes.json());
      if (mRes.ok) setMemories(await mRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (cRes.ok) setMessages(await cRes.json());
      if (sRes.ok) setSessions(await sRes.json());
      if (prRes.ok) {
        const prData = await prRes.json();
        if (prData && typeof prData === 'object') {
          setMetrics((prev) => ({ ...prev, ...prData }));
        }
      }
      if (cgRes.ok) {
        const cgData = await cgRes.json();
        if (cgData && typeof cgData === 'object') {
          setCaregiverOverview((prev) => ({ ...prev, ...cgData }));
        }
      }
      if (hRes.ok) {
        const hData = await hRes.json();
        setHealthInfo({
          geminiConfigured: hData.geminiConfigured,
          azureConfigured: hData.azureConfigured,
        });
      }
    } catch (e) {
      console.error('Error loading data from API:', e);
    }
  };

  useEffect(() => {
    loadData();

    // Firebase Connection Check & Auth Setup
    testFirestoreConnection();
    const unsubscribe = initAuth(
      (user, token) => {
        setAuthUser(user);
        if (token) setAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setAuthUser(null);
        setAccessToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Realtime Firestore Sync when Auth User is signed in
  useEffect(() => {
    if (!authUser) return;

    // Realtime tasks listener
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', authUser.uid));
    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const firestoreTasks: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, 'id'>),
        }));
        if (firestoreTasks.length > 0) {
          setTasks(firestoreTasks);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      }
    );

    return () => {
      unsubscribeTasks();
    };
  }, [authUser]);

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setAuthUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutUser();
    setAuthUser(null);
    setAccessToken(null);
  };

  // API Action Handlers
  const handleSendMessage = async (text: string, language?: string, langCodeParam?: string) => {
    setIsLoadingChat(true);

    const targetLangName = language || currentLanguage.name;
    const targetLangCode = langCodeParam || languageCode;

    // Optimistic user message addition
    const userMsg: ChatMessage = {
      id: `msg_opt_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          language: targetLangName,
          languageCode: targetLangCode,
        }),
      });

      if (res.ok) {
        const [mRes, tRes, cRes] = await Promise.all([
          fetch('/api/memories'),
          fetch('/api/tasks'),
          fetch('/api/chat/history'),
        ]);
        if (mRes.ok) setMemories(await mRes.json());
        if (tRes.ok) setTasks(await tRes.json());
        if (cRes.ok) setMessages(await cRes.json());
      }
    } catch (e) {
      console.error('Error sending chat message:', e);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/chat/history', { method: 'DELETE' });
      setMessages([]);
    } catch (e) {
      console.error('Error clearing history:', e);
    }
  };

  const handleAddMemory = async (content: string, category: any, importance: any) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, importance }),
      });
      if (res.ok) {
        const mRes = await fetch('/api/memories');
        if (mRes.ok) setMemories(await mRes.json());
      }
    } catch (e) {
      console.error('Error adding memory:', e);
    }
  };

  const handleEditMemory = async (id: string, updates: Partial<Memory>) => {
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const mRes = await fetch('/api/memories');
        if (mRes.ok) setMemories(await mRes.json());
      }
    } catch (e) {
      console.error('Error updating memory:', e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error('Error deleting memory:', e);
    }
  };

  const handleAddTask = async (title: string, description?: string, dueAt?: string, category?: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, dueAt, category }),
      });
      if (res.ok) {
        const tRes = await fetch('/api/tasks');
        if (tRes.ok) setTasks(await tRes.json());
      }
    } catch (e) {
      console.error('Error adding task:', e);
    }
  };

  const handleToggleTaskStatus = async (id: string, currentStatus: Task['status']) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const tRes = await fetch('/api/tasks');
        if (tRes.ok) setTasks(await tRes.json());
      }
    } catch (e) {
      console.error('Error updating task status:', e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  };

  const handleSubmitCognitiveAnswer = async (
    activityType: any,
    difficulty: any,
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    durationSeconds: number
  ) => {
    const res = await fetch('/api/cognitive/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityType,
        difficulty,
        question,
        userAnswer,
        expectedAnswer,
        durationSeconds,
      }),
    });
    const data = await res.json();
    const [sRes, prRes] = await Promise.all([
      fetch('/api/cognitive/history'),
      fetch('/api/progress'),
    ]);
    if (sRes.ok) setSessions(await sRes.json());
    if (prRes.ok) setMetrics(await prRes.json());
    return data;
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) setProfile(await res.json());
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await fetch(`/api/caregiver/alerts/${id}/dismiss`, { method: 'POST' });
      const cgRes = await fetch('/api/caregiver/overview');
      if (cgRes.ok) setCaregiverOverview(await cgRes.json());
    } catch (e) {
      console.error('Error dismissing alert:', e);
    }
  };

  const handleModalSelectLanguage = (langObj: LanguageOption) => {
    setLanguage(langObj.code);
    closeModal();
    handleUpdateProfile({ preferredLanguage: langObj.name });
  };

  const handleAddPhotoMemory = (newPhoto: Omit<PhotoMemory, 'id' | 'createdAt'>) => {
    const photoItem: PhotoMemory = {
      ...newPhoto,
      id: `photo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPhotoMemories((prev) => [photoItem, ...prev]);
  };

  const handleDeletePhotoMemory = (id: string) => {
    setPhotoMemories((prev) => prev.filter((p) => p.id !== id));
  };

  const handleLogCallEvent = (log: Omit<CallLog, 'id'>) => {
    const callItem: CallLog = {
      ...log,
      id: `log_${Date.now()}`,
    };
    setCallLogs((prev) => [callItem, ...prev]);
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg';
    if (fontSize === 'extra-large') return 'text-xl';
    return 'text-base';
  };

  if (!profile || !metrics) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#1C1917] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#18181B] font-bold">Initializing NeuroCare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#FAFAF9] dark:bg-stone-950 text-[#1C1917] dark:text-stone-100 ${highContrast ? 'contrast-125' : ''} ${getFontSizeClass()}`}>
      {/* Onboarding Language Selection Modal Overlay */}
      {isModalOpen && (
        <LanguageModal
          onSelectLanguage={handleModalSelectLanguage}
          isFirstVisit={!localStorage.getItem('mindsaathi_language')}
          onClose={closeModal}
        />
      )}

      {/* Incoming Call Simulation Modal */}
      <IncomingCallModal
        isOpen={isIncomingCallOpen}
        profile={profile}
        onAnswer={() => {}}
        onDeclineOrMiss={handleLogCallEvent}
        onCloseModal={() => setIsIncomingCallOpen(false)}
      />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCaregiverMode={isCaregiverMode}
        setIsCaregiverMode={setIsCaregiverMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        isSimpleMode={isSimpleMode}
        setIsSimpleMode={setIsSimpleMode}
        userName={profile?.name || 'Ramesh Sharma'}
        authUser={authUser}
        isAuthLoading={isAuthLoading}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Responsive Layout Wrapper with Sticky Bottom Mic & Left Sidebar */}
      <ResponsiveLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={isCaregiverMode ? 'caregiver' : isDoctorPortalActive ? 'doctor' : 'patient'}
        setUserRole={(role) => {
          if (role === 'caregiver') {
            setIsCaregiverMode(true);
            setIsDoctorPortalActive(false);
          } else if (role === 'doctor') {
            setIsDoctorPortalActive(true);
          } else {
            setIsCaregiverMode(false);
            setIsDoctorPortalActive(false);
          }
        }}
        profile={profile}
        metrics={metrics}
        photoMemories={photoMemories}
        onToggleVoiceMic={() => setActiveTab('chat')}
        onTriggerTestCall={() => setIsIncomingCallOpen(true)}
      >
        {isDoctorPortalActive ? (
          <DoctorPortal
            patientProfile={profile}
            onAssignTasks={(assignedGames) => {
              setIsDoctorPortalActive(false);
              setActiveTab('cognitive');
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                profile={profile}
                memories={memories}
                tasks={tasks}
                metrics={metrics}
                setActiveTab={setActiveTab}
                onVoiceTalkClick={() => setActiveTab('chat')}
                isSimpleMode={isSimpleMode}
              />
            )}

            {activeTab === 'chat' && (
              <ChatView
                profile={profile}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearHistory={handleClearHistory}
                isLoading={isLoadingChat}
              />
            )}

            {activeTab === 'cognitive' && (
              <CognitiveView
                onQuestionSubmit={handleSubmitCognitiveAnswer}
                sessions={sessions}
                photos={photoMemories}
                profile={profile}
              />
            )}

            {activeTab === 'memory' && (
              <MemoryView
                memories={memories}
                onAddMemory={handleAddMemory}
                onEditMemory={handleEditMemory}
                onDeleteMemory={handleDeleteMemory}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskView
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTaskStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                accessToken={accessToken}
                onSignInRequired={handleGoogleSignIn}
                onSelectEmergencyContact={(contactName, phone) => {
                  handleUpdateProfile({ emergencyContact: `${contactName} (${phone})` });
                }}
                onSimulateCall={(contactName, role) => {
                  setIsIncomingCallOpen(true);
                }}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView metrics={metrics} sessions={sessions} />
            )}

            {activeTab === 'caregiver' && caregiverOverview && (
              <CaregiverDashboardTabs
                overview={caregiverOverview}
                photoMemories={photoMemories}
                callLogs={callLogs}
                onAddPhoto={handleAddPhotoMemory}
                onDeletePhoto={handleDeletePhotoMemory}
                onAddTask={handleAddTask}
                onToggleTaskStatus={handleToggleTaskStatus}
                onDeleteTask={handleDeleteTask}
                onDismissAlert={handleDismissAlert}
                onTriggerEmergencyBeacon={() => setIsIncomingCallOpen(true)}
                accessToken={accessToken}
                onSignInRequired={handleGoogleSignIn}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                fontSize={fontSize}
                setFontSize={setFontSize}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
                onClearHistory={handleClearHistory}
                healthInfo={healthInfo}
              />
            )}
          </>
        )}
      </ResponsiveLayout>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
