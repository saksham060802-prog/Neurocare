import React, { useState } from 'react';
import {
  HeartPulse,
  MapPin,
  CheckSquare,
  Image as ImageIcon,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Bell,
  Navigation,
  Sparkles,
  Activity,
  Calendar,
  Users,
} from 'lucide-react';
import {
  CaregiverOverview,
  PhotoMemory,
  CallLog,
  GeofenceZone,
  Task,
} from '../types';
import { CollaborativeMemoryVault } from './CollaborativeMemoryVault';
import { GoogleCalendarWidget } from './GoogleCalendarWidget';
import { GoogleContactsWidget } from './GoogleContactsWidget';

interface CaregiverDashboardTabsProps {
  overview: CaregiverOverview;
  photoMemories: PhotoMemory[];
  callLogs: CallLog[];
  onAddPhoto: (photo: Omit<PhotoMemory, 'id' | 'createdAt'>) => void;
  onDeletePhoto: (id: string) => void;
  onAddTask: (title: string, description?: string, dueAt?: string) => void;
  onToggleTaskStatus: (id: string, currentStatus: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onDismissAlert: (id: string) => void;
  onTriggerEmergencyBeacon: () => void;
  accessToken?: string | null;
  onSignInRequired?: () => void;
}

export const CaregiverDashboardTabs: React.FC<CaregiverDashboardTabsProps> = ({
  overview,
  photoMemories,
  callLogs,
  onAddPhoto,
  onDeletePhoto,
  onAddTask,
  onToggleTaskStatus,
  onDeleteTask,
  onDismissAlert,
  onTriggerEmergencyBeacon,
  accessToken = null,
  onSignInRequired = () => {},
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'geo' | 'tasks' | 'vault' | 'logs'>('overview');

  // Task Creation Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Geofence Zone State for Shillong, Meghalaya
  const [geofence, setGeofence] = useState<GeofenceZone>({
    centerLat: 25.5788,
    centerLng: 91.8933,
    radiusMeters: 1000,
    locationName: 'Shillong Residence (North-East Safe Zone)',
    currentLat: 25.5792,
    currentLng: 91.8941,
    isWandering: false,
    lastUpdated: '2 mins ago',
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, newTaskDesc);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddTaskModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in bg-white text-black">
      {/* 5-Tab Structured Navigation Bar */}
      <section className="bg-white rounded-3xl p-3 border-2 border-black sticky top-16 z-20">
        <div className="grid grid-cols-5 gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 px-2 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all border border-black ${
              activeSubTab === 'overview'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('geo')}
            className={`py-3 px-2 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all border border-black ${
              activeSubTab === 'geo'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Live Geo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`py-3 px-2 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all border border-black ${
              activeSubTab === 'tasks'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tasks</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vault')}
            className={`py-3 px-2 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all border border-black ${
              activeSubTab === 'vault'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Vault Sync</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`py-3 px-2 rounded-2xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all border border-black ${
              activeSubTab === 'logs'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-black hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Call Logs</span>
          </button>
        </div>
      </section>

      {/* TAB 1: OVERVIEW & STATUS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border-2 border-black space-y-2">
              <p className="text-xs font-black uppercase text-neutral-600">Daily Clarity Score</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-black">
                  {overview?.metrics?.overallScore ?? 83}%
                </p>
                <span className="text-xs font-black text-black bg-white px-2 py-0.5 rounded-full border border-black">
                  Stable
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-black space-y-2">
              <p className="text-xs font-black uppercase text-neutral-600">Routine Adherence</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-black">
                  {Math.round(((overview?.completedTasksCount ?? 3) / Math.max(1, overview?.totalTasksCount ?? 5)) * 100)}%
                </p>
                <span className="text-xs font-black text-black">
                  {overview?.completedTasksCount ?? 3}/{overview?.totalTasksCount ?? 5} Done
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-black space-y-2">
              <p className="text-xs font-black uppercase text-neutral-600">Memory Recall Level</p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-black text-black">
                  {overview?.metrics?.currentLevel ?? 'MEDIUM'}
                </p>
                <span className="text-xs font-black text-neutral-600">
                  {overview?.metrics?.streakDays ?? 5} Day Streak
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-black space-y-2">
              <p className="text-xs font-black uppercase text-neutral-600">Emergency Beacon</p>
              <button
                onClick={onTriggerEmergencyBeacon}
                className="w-full py-2 bg-black text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 hover:bg-white hover:text-black border-2 border-black transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Trigger Emergency SOS</span>
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <section className="bg-white rounded-3xl p-6 border-2 border-black space-y-4">
            <h3 className="text-base font-black text-black">
              Real-Time Caregiver Alerts ({overview.alerts.length})
            </h3>
            {overview.alerts.length === 0 ? (
              <p className="text-xs font-bold text-neutral-600 py-4">
                No active critical alerts. Routine is proceeding normally.
              </p>
            ) : (
              overview.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-white rounded-2xl border-2 border-black flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-black" />
                    <div>
                      <p className="text-xs font-black text-black">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-neutral-600 font-bold">
                        {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="px-3 py-1 bg-white hover:bg-black hover:text-white border border-black text-black rounded-xl text-[10px] font-black"
                  >
                    Dismiss
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Google Workspace Live Integrations Grid */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-wider border border-black">
                Caregiver Sync
              </span>
              <h3 className="text-base font-black text-black">
                Google Calendar & Contacts Integration
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GoogleCalendarWidget
                accessToken={accessToken}
                onSignInRequired={onSignInRequired}
                tasks={overview.tasks}
              />

              <GoogleContactsWidget
                accessToken={accessToken}
                onSignInRequired={onSignInRequired}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE GEO & SAFE-ZONE */}
      {activeSubTab === 'geo' && (
        <div className="space-y-6 animate-fade-in">
          <section className="bg-white rounded-3xl p-6 border-2 border-black space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-black">
                  Live GPS Safe-Zone & Wandering Alert
                </h3>
                <p className="text-xs font-bold text-neutral-600">
                  Location: {geofence.locationName}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-black text-white border border-black">
                Inside Safe Zone ({geofence.radiusMeters}m)
              </span>
            </div>

            {/* Interactive North-East India Map Canvas Simulation */}
            <div className="relative h-80 bg-white rounded-3xl overflow-hidden border-2 border-black flex items-center justify-center">
              {/* Radar Grid Graphic */}
              <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

              {/* Geofence Safe Radius Circle */}
              <div className="w-56 h-56 rounded-full border-2 border-black bg-neutral-100 flex items-center justify-center animate-pulse">
                {/* Current Elder Marker */}
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center border-2 border-black shadow-lg">
                  <Navigation className="w-5 h-5 text-white animate-bounce" />
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-2xl border-2 border-black text-black text-xs space-y-1">
                <p className="font-black">Current Coordinates:</p>
                <p className="font-mono text-[11px] font-bold text-black">
                  Lat: {geofence.currentLat}° N | Lng: {geofence.currentLng}° E
                </p>
              </div>
            </div>

            {/* Geofence Controls */}
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-black">
              <div className="space-y-1">
                <p className="text-xs font-black text-black">
                  Safe-Zone Radius Threshold
                </p>
                <p className="text-[10px] text-neutral-600 font-bold">
                  Triggers immediate SMS/Voice alert to caregiver if elder leaves radius.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {[500, 1000, 2500, 5000].map((r) => (
                  <button
                    key={r}
                    onClick={() => setGeofence((prev) => ({ ...prev, radiusMeters: r }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border border-black ${
                      geofence.radiusMeters === r
                        ? 'bg-black text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {r >= 1000 ? `${r / 1000}km` : `${r}m`}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: DAILY ACTIVITY & TASKS */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-6 animate-fade-in">
          <section className="bg-white rounded-3xl p-6 border-2 border-black space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h3 className="text-lg font-black text-black">
                  Daily Checklist & Task Allocator
                </h3>
                <p className="text-xs font-bold text-neutral-600">
                  Schedule medication, walks, and cognitive games for elder
                </p>
              </div>

              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2.5 bg-black text-white border-2 border-black rounded-2xl text-xs font-black flex items-center space-x-1.5 hover:bg-white hover:text-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {overview.pendingTasks.concat(overview.recentSessions as any).length === 0 ? (
                <p className="text-xs text-neutral-600 font-bold py-4">No pending tasks.</p>
              ) : (
                overview.pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-white rounded-2xl border-2 border-black flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onToggleTaskStatus(task.id, task.status)}
                        className={`w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center ${
                          task.status === 'completed'
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <p className={`text-sm font-black ${task.status === 'completed' ? 'line-through text-neutral-500' : 'text-black'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-neutral-600 font-bold">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-black hover:bg-black hover:text-white p-2 rounded-lg border border-black transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Add Task Modal */}
          {showAddTaskModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border-4 border-black space-y-4">
                <h4 className="text-base font-black text-black">
                  Add New Task for Elder
                </h4>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task Title (e.g. Take Blood Pressure Meds)"
                    className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-bold text-black"
                  />
                  <textarea
                    rows={2}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Instructions / Notes..."
                    className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-bold text-black"
                  />
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="px-4 py-2 text-xs font-black text-black border border-black rounded-xl hover:bg-black hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black text-white border-2 border-black rounded-xl text-xs font-black hover:bg-white hover:text-black transition-all"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEMORY VAULT SYNC */}
      {activeSubTab === 'vault' && (
        <CollaborativeMemoryVault
          profile={overview.patientProfile}
          photos={photoMemories}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
        />
      )}

      {/* TAB 5: CALL & SOS LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6 animate-fade-in">
          <section className="bg-white rounded-3xl p-6 border-2 border-black space-y-4">
            <h3 className="text-base font-black text-black">
              Voice Call & SOS Logs ({callLogs.length})
            </h3>

            {callLogs.length === 0 ? (
              <p className="text-xs text-neutral-600 font-bold py-4">No recent calls logged.</p>
            ) : (
              callLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-white rounded-2xl border-2 border-black flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white bg-black border border-black">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-black">
                        {log.callerName} ({log.callerRole})
                      </p>
                      <p className="text-[10px] text-neutral-600 font-bold">
                        Type: {log.callType} • {log.gpsCoordinates.locationName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black text-white border border-black">
                      {log.status}
                    </span>
                    <p className="text-[10px] text-neutral-600 font-bold mt-1">
                      {new Date(log.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
};
